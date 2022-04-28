from IPython.display import Markdown, display


def print_high(msg):
    display(Markdown(f"**{msg}**"))


def print_ok(msg):
    Markdown(
        f"<pre><font color='green'>{msg}</font></pre>"
    )
