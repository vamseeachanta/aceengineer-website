import argparse
import os

import isort
from yapf.yapflib.yapf_api import FormatFile

parser = argparse.ArgumentParser(description='This program formats the passed Python file using "isort", then "yapf".')
parser.add_argument('-f',
                    '--filepath',
                    help='The path of the Python file to be auto-formatted',
                    type=str,
                    required=True)
args = parser.parse_args()

isort.file(args.filepath)

style_config_filename = os.path.join('api', 'dev_scripts', '.style.yapf')
style_config = style_config_filename if os.path.isfile(style_config_filename) else None
FormatFile(args.filepath, style_config=style_config, in_place=True)
