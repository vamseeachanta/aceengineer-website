import logging
import os
import sys

sys.path.extend(['..'])

from common.data import AttributeDict
from services.GoMFields.gom_fields_components import GoMFieldsComponents
from services.GoMFields.GoMFields import assign_data_and_update_menu_items

cfg = AttributeDict({'gom_block': 'WR627'})
gom_fc = GoMFieldsComponents(cfg=cfg)


def get_data_for_UI(gom_block):
    data_df, data_dict = gom_fc.get_data_for_UI(gom_block)

    logging.info("Completed gom field data from Database for {}".format(gom_block))


def test_service_gom_block_UI(gom_block):
    assign_data_and_update_menu_items(gom_block, test_flag=True)


if __name__ == '__main__':

    # Supporting functions
    get_data_for_UI(gom_block='WR508')
    test_service_gom_block_UI(gom_block='WR508')
