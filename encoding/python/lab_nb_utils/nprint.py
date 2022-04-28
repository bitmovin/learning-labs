from IPython.display import Markdown, display


def _build_msg(msg, code=None, color=None, bold=True):
    out = msg
    if code:
        out += f" <code>{code}</code>"
    if bold:
        out = f"<b>{out}</b>"
    if color:
        out = f"<font color='{color}'>{out}</font>"
    return Markdown(out)


def info(msg, val=None):
    display(_build_msg(msg, val, None, True))


def ok(msg, val=None):
    display(_build_msg(msg, val, 'green', True))


def error(msg, val=None):
    display(_build_msg(msg, val, 'red', True))


def debug(msg, val=None):
    display(_build_msg(msg, val, 'gray', None))
