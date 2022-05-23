from setuptools import setup

setup(
    name='encoding-learning-labs',
    version='0.3',
    packages=['lab_nb_utils'],
    install_requires=[
        'bitmovin-api-sdk',
        'boto3==1.12.1',   # OLD version to ensure compatibility of urllib3 with the one used by bitmovin-api-sdk
        'Pygments'
    ],
    url='',
    license='',
    author='fabre.lambeau',
    author_email='fabe.lambeau@bitmovin.com',
    description='Helpers for Bitmovin Encoding tutorials'
)
