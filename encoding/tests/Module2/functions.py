import uuid
from . import config

def get_uuid():
    return str(uuid.uuid4())

def validate():
    assert config.KEY != ''
