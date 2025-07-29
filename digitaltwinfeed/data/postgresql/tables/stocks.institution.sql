SET search_path TO stocks;
--drop table if exists analysis;

create table IF not exists institution(
	ticker              text        not null,
	name                text        null,
	summary             json        null,
    quarter_end_date    date        null,
    signatureDate       date        null,
    updated_time        timestamp   null,
    sec                 json        null,
    yf                  json        null,
    status              json        null,

	CONSTRAINT institution_unique UNIQUE(ticker, quarter_end_date   )
	);
