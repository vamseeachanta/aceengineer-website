import re

import pytest

from common.data import RegEx

re_methods = RegEx()


def test_replace_in_string_simple_replace():
    data_string = 'CUSIP No./n/n/n 2543682'
    pattern = r'CUSIP No.'
    replace_with = ''
    cfg_temp = {'data_string': data_string, 'pattern': pattern, 'replace_with': replace_with}

    result_string = re_methods.replace_in_string(cfg=cfg_temp)
    assert (result_string == '/n/n/n 2543682')
    print(f"Unmodified string: \n{data_string}".format(data_string))
    print(f"Modified string: \n{result_string}".format(result_string))


def test_replace_in_newline_pattern_replace1():
    data_string = 'CUSIP No./n/n/n 2543682 /n '
    pattern = [r'(CUSIP No.(.*)/n)']
    replace_with = 'CUSIP No.'
    cfg_temp = {'data_string': data_string, 'pattern': pattern, 'replace_with': replace_with}

    result_string = re_methods.replace_in_string(cfg=cfg_temp)
    assert (result_string == 'CUSIP No. 2543682')
    print(f"Unmodified string: \n{data_string}".format(data_string))
    print(f"Modified string: \n{result_string}".format(result_string))


def test_replace_in_pattern_array_replace2():
    data_string = 'CUSIP No./n/n/n 2543682 abc /n CUSIP No./n/n/n 3543683'
    pattern = [r'CUSIP No.\s', r'CUSIP No.[//n]*']
    replace_with = 'CUSIP No.'
    cfg_temp = {'data_string': data_string, 'pattern': pattern, 'replace_with': replace_with}
    result_string = re_methods.replace_in_string(cfg=cfg_temp)
    print(f"Unmodified string: \n{data_string}".format(data_string))
    print(f"Modified string: \n{result_string}".format(result_string))
    assert (result_string == 'CUSIP No. 2543682')

    data_string = '2(e). CUSIP Number:/n/n 31810Q107\n\n 3(e). CUSIP Number: \n\n41adaR108\n 4(e). CUSIP Number: 51adaS109\n'
    pattern = [r'CUSIP Number:(\s*)', r'CUSIP Number:[//n]*']
    replace_with = 'CUSIP Number: '
    cfg_temp = {'data_string': data_string, 'pattern': pattern, 'replace_with': replace_with}
    result_string = re_methods.replace_in_string(cfg=cfg_temp)
    print(f"Unmodified string: \n{data_string}".format(data_string))
    print(f"Modified string: \n{result_string}".format(result_string))


def test_find_all_patterns():
    re.findall(r'all (.*?) are', 'all cats are smarter than dogs, all dogs are dumber than cats')
    re.findall(r'all  (.*?) are', 'all  cats are smarter than dogs, all dogs are dumber than cats')

    data_string = '\n\nCUSIP Number:\n\n\n\n\n31810Q107\n\n\n\n\n\n\n\n adsfad \nCUSIP Number:\n\n\n\n\n31810Q107\n'
    pattern = r'CUSIP Number:(/s)[\w]{9}$'
    print(re.findall(pattern, data_string))


def test_string_without_spaces(self, cfg):
    data_string = 'CUSIP No. /x0a 2543682'
    pattern = r'[^\x00-\x7F]+'
    replace_with = ['CUSIP No.']

    cfg_temp = {'data_string': data_string, 'pattern': pattern, 'replace_with': replace_with}

    result_string = re_methods.replace_in_string(cfg=cfg_temp)
    assert (result_string == 'CUSIP No. 2543682')
    print(f"Unmodified string: \n{data_string}".format(data_string))
    print(f"Modified string: \n{result_string}".format(result_string))


def test_without_html_tags():
    data_string = '''
                <td><a href="http://www.irit.fr/SC">Signal et Communication</a>
                <br/><a href="http://www.irit.fr/IRT"> communications</a>
                </td>
                '''
    features = 'lxml'

    cfg_temp = {'data_string': data_string, 'features': features}
    result_string = re_methods.get_without_html_tags(cfg=cfg_temp)
    # assert (result_string == 'CUSIP No. 2543682')
    print(f"Unmodified string: \n{data_string}".format(data_string))
    print(f"Modified string: \n{result_string}".format(result_string))


if __name__ == '__main__':
    # test_replace_in_string_simple_replace()
    # test_replace_in_newline_pattern_replace1()
    test_replace_in_pattern_array_replace2()
    # test_without_html_tags()
