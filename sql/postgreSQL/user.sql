-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    firstname character varying(32) COLLATE pg_catalog."default",
    lastname character varying(32) COLLATE pg_catalog."default",
    username character varying(16) COLLATE pg_catalog."default" NOT NULL,
    about text COLLATE pg_catalog."default",
    dateregistered timestamp without time zone NOT NULL DEFAULT now(),
    password character varying(64) COLLATE pg_catalog."default",
    passwordsalt character varying(32) COLLATE pg_catalog."default",
    email character varying(64) COLLATE pg_catalog."default" NOT NULL,
    avatarurl character varying(1024) COLLATE pg_catalog."default",
    role text COLLATE pg_catalog."default",
    google_id character varying(255) COLLATE pg_catalog."default",
    auth_provider character varying(50) COLLATE pg_catalog."default" DEFAULT 'basic'::character varying,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;