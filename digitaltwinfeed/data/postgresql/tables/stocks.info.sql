SET search_path TO stocks;
--drop table if exists analysis;

create table IF not exists info(
	label           text        not null,
	description     text        null,
    updated_time    timestamp   null,
    data            json        null,

	CONSTRAINT ticker_unique UNIQUE(label)
	);
