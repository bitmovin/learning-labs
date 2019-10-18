import uuid
import config


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
    assert (config.S3_BUCKET_NAME != ''), "S3_BUCKET_NAME is not set"
    assert (config.S3_ACCESS_KEY != ''), "S3_ACCESS_KEY is not set"
    assert (config.S3_SECRET_KEY != ''), "S3_SECRET_KEY is not set"
    assert (config.MY_ID != ''), "MY_ID is not set"


def build_output_path():
    return f"outputs/{config.MY_ID}-{get_uuid()}"
