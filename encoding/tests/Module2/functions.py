import uuid

def get_uuid():
    return str(uuid.uuid4())

def validate():
    global KEY
    assert KEY != ''