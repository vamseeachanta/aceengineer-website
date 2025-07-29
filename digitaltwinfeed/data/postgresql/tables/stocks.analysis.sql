SET search_path TO stocks;
--drop table if exists analysis;

create table IF not exists analysis(
	ticker          text        not null,
	summary         json        null,
    breakout_trends json        null,
    insider         json        null,
    institution     json        null,
    option          json        null,
    ta              json        null,

    updated_time    timestamp   null,
    status          json        null,

	CONSTRAINT analysis_unique UNIQUE(ticker)

	);
