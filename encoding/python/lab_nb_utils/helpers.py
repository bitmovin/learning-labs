import uuid
import config
import nprint


def get_uuid():
    return str(uuid.uuid4())


def validate_config():
    module = globals().get('config', None)
    if module:
        for key, value in module.__dict__.items():
            if not (key.startswith('__') or key.startswith('_')):
                # removing whitespaces
                if isinstance(value, str):
                    config.__dict__[key] = value.strip()
    else:
        raise Exception("Module 'config' not found")

    assert (config.API_KEY != ''), "API_KEY is not set"

    if not getattr(config, 'OUTPUT_ID'):
        assert (config.S3_BUCKET_NAME != ''), "S3_BUCKET_NAME is not set"
        assert (config.S3_ACCESS_KEY != ''), "S3_ACCESS_KEY is not set"
        assert (config.S3_SECRET_KEY != ''), "S3_SECRET_KEY is not set"

    assert (config.MY_LABEL != ''), "MY_LABEL is not set"

    return "Your configuration appears complete"


def build_output_path():
    return f"outputs/{config.MY_LABEL}-{get_uuid()}"


def build_dashboard_url(encoding_id):
    return f"https://bitmovin.com/dashboard/encoding/encodings/{encoding_id}?apiKey={config.API_KEY}&orgId={config.ORG_ID}"


def patch_for_nprint(original_func):
    def wrapper(self, method, relative_url, payload=None, raw_response=False, query_params=None, **kwargs):
        # run original function
        res = original_func(self, method, relative_url, payload, raw_response, query_params, **kwargs)

        if res.__class__.__name__ not in ['BitmovinResponse']:
            m = ""
            if method == "POST":
                m = "Created"
            if method == "GET":
                m = "Retrieved"

            nprint.resource(m, res)

        # return results of the original function
        return res

    return wrapper