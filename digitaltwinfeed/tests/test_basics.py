import json


def test_index(app, client):
    import yaml
    with open('tests/test_configuration.yml', 'r') as ymlfile:
        cfg = yaml.load(ymlfile, Loader=yaml.Loader)

    for test_item in cfg['tests']:
        res = client.get(test_item['end_point'])
        assert res.status_code == test_item['status_code']
