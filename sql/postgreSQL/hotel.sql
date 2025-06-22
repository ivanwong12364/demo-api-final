-- Table: public.hotel

-- DROP TABLE IF EXISTS public.hotel;

CREATE TABLE IF NOT EXISTS public.hotel
(
    id integer NOT NULL DEFAULT nextval('hoteldata_id_seq'::regclass),
    title character varying(32) COLLATE pg_catalog."default" NOT NULL,
    alltext text COLLATE pg_catalog."default" NOT NULL,
    summary text COLLATE pg_catalog."default",
    datecreated timestamp without time zone NOT NULL DEFAULT now(),
    datemodified timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    imageurl character varying(2048) COLLATE pg_catalog."default",
    published boolean NOT NULL DEFAULT false,
    agencyid integer,
    description text COLLATE pg_catalog."default",
    CONSTRAINT hoteldata_pkey PRIMARY KEY (id),
    CONSTRAINT fk_hotel FOREIGN KEY (agencyid)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hotel
    OWNER to postgres;