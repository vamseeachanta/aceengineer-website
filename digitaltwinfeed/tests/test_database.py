def test_database_connection(service):
    from common.database import (get_db_connection,
                                 get_db_properties_for_service)
    db_properties = get_db_properties_for_service(service)
    dbe, connection_status = get_db_connection(db_properties=db_properties)
    if connection_status:
        print("Database connection successful")


if __name__ == '__main__':
    test_database_connection(service='StockAnalysis')
