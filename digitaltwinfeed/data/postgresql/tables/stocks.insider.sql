SET search_path TO stocks;
--drop table if exists analysis;

create table IF not exists insider(
	ticker              text        not null,
	summary             json        null,
    updated_time        timestamp   null,
    sec                 json        null,
    yf                  json        null,
    finviz              json        null,
    status              json        null,

	CONSTRAINT insider_unique UNIQUE(ticker)
	);
