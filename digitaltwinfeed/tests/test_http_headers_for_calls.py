import sys

import urllib3

sys.path.extend(['..'])


def test_http_headers_for_calls():

    headers_default = {
        'User-Agent': 'Vamsee Achanta support@aceengineer.com',
        'Accept-Encoding': "identity",
        'Host': 'httpbin.org'
    }

    http = urllib3.PoolManager(1, headers=headers_default)
    r1 = http.urlopen('GET', 'http://httpbin.org/headers')
    r1_data = r1.data.decode()
    substring = headers_default['User-Agent']
    if substring in r1_data:
        print("Provided headers are in http call. See result below")
        print(r1.data)
    else:
        print("Provided headers are NOT in http call. CHECK/CAUTION before using the function. See result below")
        print(r1.data)


if __name__ == '__main__':
    test_http_headers_for_calls()
