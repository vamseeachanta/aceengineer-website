SET search_path TO stocks;
--drop table if exists analysis;

create table IF not exists EOD(
	ticker              text        not null,
	summary             json        null,
    updated_time        timestamp   null,
    yf                  json        null,
    finviz              json        null,
    status              json        null,

	CONSTRAINT EOD_unique UNIQUE(ticker)
	);
