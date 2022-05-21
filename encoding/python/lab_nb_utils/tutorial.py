import config
from re import split
import uuid
import bitmovin_api_sdk as bm
import boto3

import nprint


class TutorialHelper:

    def __init__(self, printer="IPython"):
        self._reload_config()
        self.api: bm.BitmovinApi = None
        self.user = None
        self.org = None

        self.printer = nprint.TutorialPrinter(output_type=printer)

        bm.ApiClient.request = nprint_patch(bm.ApiClient.request, self.printer)

    def _reload_config(self):
        module = globals().get('config', None)
        if module:
            for key, value in module.__dict__.items():
                if not (key.startswith('__') or key.startswith('_')):
                    # removing whitespaces
                    if isinstance(value, str):
                        config.__dict__[key] = value.strip()
        else:
            raise Exception("Module 'config' not found")

    def validate(self, output=True):
        self._reload_config()
        try:
            self._validate_api_key()
            self._validate_org_id()
            if output:
                self._validate_output()
            self._validate_label()

            output_path = self.output_path
            self.printer.info("Your output files will be written into folder {path}",
                              highvars=dict(path=output_path))

            self.printer.ok("Your configuration appears complete. You are good to go!")
        except Exception as e:
            self.printer.error("There is an issue with your configuration: ")
            self.printer.error(e.args[0], bold=True)

    def _validate_api_key(self):
        if not config.API_KEY:
            raise ValueError("You have not defined the API_KEY")

        try:
            uuid.UUID(config.API_KEY, version=4)
        except ValueError:
            raise ValueError("The API_KEY should be a UUID")

        self.api = bm.BitmovinApi(api_key=config.API_KEY)
        try:
            self.user = self.api.account.information.get()
            if self.user.first_name:
                self.printer.info("Hi {fn}, and welcome to this tutorial!",
                                  highvars=dict(fn=self.user.first_name))
            else:
                self.printer.info("Hi {em}, and welcome to this tutorial!",
                                  highvars=dict(em=self.user.email))

        except Exception:
            raise ValueError("The API_KEY is not recognized as a valid one by the Bitmovin platform")

    def _validate_org_id(self):
        if not config.ORG_ID:
            self.printer.info("You have not defined an ORG_ID, "
                              "you will therefore be working with resources in your own account")
            return

        try:
            uuid.UUID(config.ORG_ID, version=4)
        except ValueError:
            raise ValueError("The ORG_ID should be a UUID")

        self.api = bm.BitmovinApi(api_key=config.API_KEY)
        try:
            self.org = self.api.account.organizations.get(organization_id=config.ORG_ID)
            self.printer.info("You are working with resources in the organization named {org}",
                              highvars=dict(org=self.org.name))

        except bm.BitmovinError as e:
            if e.developer_message == 'Organization could not be found' \
                    or e.developer_message == 'Id not found, check the organization list for valid ids':
                raise ValueError(
                    "You do not have permissions to work in that organization, "
                    "or the ORG_ID does not represent a valid organization")
            else:
                raise ValueError(e.developer_message)

    def _validate_output(self):
        if not getattr(config, 'OUTPUT_ID'):
            if not config.S3_ACCESS_KEY or not config.S3_BUCKET_NAME or not config.S3_SECRET_KEY:
                raise ValueError("You need to define all 3 of S3_BUCKET_NAME, S3_ACCESS_KEY and S3_SECRET_KEY")

            try:
                s3 = boto3.client('s3', aws_access_key_id=config.S3_ACCESS_KEY,
                                  aws_secret_access_key=config.S3_SECRET_KEY)
                s3.head_bucket(Bucket=config.S3_BUCKET_NAME)
                self.printer.info("The S3 bucket {bucket} is reachable and will be used to store outputs",
                                  highvars=dict(bucket=config.S3_BUCKET_NAME))
            except Exception as e:
                raise ValueError(
                    "There seems to be a problem accessing the S3 bucket. Do you have the correct details?")
        else:
            try:
                output = self.api.encoding.outputs.get(output_id=config.OUTPUT_ID)
                output_type = next(k for k, v in output.discriminator_value_class_map.items()
                                   if v == output.__class__.__name__)
                self.printer.info("The {type} storage into which outputs will be stored is {name}",
                                  highvars=dict(name=output.bucket_name or output.name,
                                                type=output_type))
            except Exception as e:
                raise ValueError("This OUTPUT_ID is invalid or is not a resource in this organization")

    def _validate_label(self):
        if not config.MY_LABEL:
            l = str(uuid.uuid4())[:6]
            self.printer.info("You didn't set a label. So I chose {label} for you. You're welcome!",
                              highvars=dict(label=l))
            config.MY_LABEL = l
            return config.MY_LABEL

        l = camelize(config.MY_LABEL)
        if config.MY_LABEL != l:
            self.printer.warning(
                "Oi, invalid label!  This is an IT solution. We don't like spaces or funny characters in our labels!")
            self.printer.warning("So, instead I decided that your label will now be {label}. You're welcome!",
                                 highvars=dict(label=l))
            config.MY_LABEL = l
        return config.MY_LABEL

    @property
    def output_path(self):
        output_path = f"outputs/{config.MY_LABEL}-{str(uuid.uuid4())[:8]}"
        return output_path

    @staticmethod
    def get_dashboard_url(encoding_id):
        return f"https://bitmovin.com/dashboard/encoding/encodings/{encoding_id}?" \
               f"apiKey={config.API_KEY}&orgId={config.ORG_ID}"

    @staticmethod
    def get_player_test_url(manifest_type, manifest_url):
        return f"https://bitmovin.com/demos/stream-test?" \
               f"format={manifest_type}&manifest={manifest_url}"

def camelize(string):
    if not string.isalnum():
        return ''.join(a.capitalize() for a in split('([^a-zA-Z0-9])', string)
                       if a.isalnum())
    return string


def nprint_patch(original_func, np: nprint.TutorialPrinter):
    """ Monkey path for the API client, to output details of any created resource """

    def wrapper(self, method, relative_url, payload=None, raw_response=False, query_params=None, **kwargs):
        # run original function
        res = original_func(self, method, relative_url, payload, raw_response, query_params, **kwargs)

        if not relative_url.startswith("/account"):
            if res.__class__.__name__ not in ['BitmovinResponse']:
                np.info_rest_operation(method, res, relative_url)

        # if not isinstance(self.rest_client.logger, bm.BitmovinApiLogger):
        #     self.rest_client.logger.log('RESPONSE: {}'.format("DATA"), res)

        # return results of the original function
        return res

    return wrapper


helper = TutorialHelper()
printer = helper.printer
