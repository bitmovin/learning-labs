from IPython.display import Markdown, display


def info(msg):
    display(Markdown(f"**{msg}**"))


def ok(msg):
    display(Markdown(
        f"<font color='green'>{msg}</font>"
    ))


def error(msg):
    display(Markdown(
        f"<font color='red'>{msg}</font>"
    ))
