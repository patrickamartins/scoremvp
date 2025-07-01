--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: notificationtarget; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.notificationtarget AS ENUM (
    'ALL',
    'PLAYERS',
    'MVP',
    'TEAM'
);


ALTER TYPE public.notificationtarget OWNER TO admin;

--
-- Name: userplan; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.userplan AS ENUM (
    'FREE',
    'PRO',
    'TEAM'
);


ALTER TYPE public.userplan OWNER TO admin;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.userrole AS ENUM (
    'SUPERADMIN',
    'TEAM_ADMIN',
    'SCOUT',
    'PLAYER',
    'GUEST'
);


ALTER TYPE public.userrole OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO admin;

--
-- Name: game_player; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.game_player (
    game_id integer,
    player_id integer
);


ALTER TABLE public.game_player OWNER TO admin;

--
-- Name: games; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.games (
    id integer NOT NULL,
    opponent character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    "time" character varying,
    location character varying,
    categoria character varying,
    status character varying,
    owner_id integer,
    created_at timestamp without time zone DEFAULT '2025-06-19 20:20:15.848699'::timestamp without time zone
);


ALTER TABLE public.games OWNER TO admin;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.games_id_seq OWNER TO admin;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    nome character varying NOT NULL,
    email character varying NOT NULL,
    whatsapp character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leads OWNER TO admin;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO admin;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    content character varying(250) NOT NULL,
    url character varying(255),
    target public.notificationtarget NOT NULL,
    created_at timestamp without time zone,
    created_by integer NOT NULL
);


ALTER TABLE public.notifications OWNER TO admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.players (
    id integer NOT NULL,
    name character varying NOT NULL,
    number integer,
    "position" character varying,
    categoria character varying,
    active boolean,
    created_at timestamp without time zone DEFAULT '2025-06-19 20:20:15.848699'::timestamp without time zone
);


ALTER TABLE public.players OWNER TO admin;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO admin;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: statistics; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.statistics (
    id integer NOT NULL,
    game_id integer NOT NULL,
    player_id integer NOT NULL,
    points integer,
    rebounds integer,
    assists integer,
    steals integer,
    blocks integer,
    fouls integer,
    minutes_played double precision,
    quarter integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    two_attempts integer DEFAULT 0,
    two_made integer DEFAULT 0,
    three_attempts integer DEFAULT 0,
    three_made integer DEFAULT 0,
    free_throw_attempts integer DEFAULT 0,
    free_throw_made integer DEFAULT 0,
    interference integer DEFAULT 0
);


ALTER TABLE public.statistics OWNER TO admin;

--
-- Name: statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.statistics_id_seq OWNER TO admin;

--
-- Name: statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.statistics_id_seq OWNED BY public.statistics.id;


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    notification_id integer NOT NULL,
    is_read boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.user_notifications OWNER TO admin;

--
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.user_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_notifications_id_seq OWNER TO admin;

--
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.user_notifications_id_seq OWNED BY public.user_notifications.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    role public.userrole NOT NULL,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    plan public.userplan NOT NULL,
    stripe_customer_id character varying,
    stripe_subscription_id character varying,
    last_payment_date timestamp without time zone,
    next_payment_date timestamp without time zone,
    card_last4 character varying,
    card_brand character varying,
    profile_image character varying,
    phone character varying,
    cpf character varying,
    favorite_team character varying,
    playing_team character varying
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: statistics id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.statistics ALTER COLUMN id SET DEFAULT nextval('public.statistics_id_seq'::regclass);


--
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications ALTER COLUMN id SET DEFAULT nextval('public.user_notifications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.alembic_version (version_num) FROM stdin;
b586eaa02652
\.


--
-- Data for Name: game_player; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.game_player (game_id, player_id) FROM stdin;
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.games (id, opponent, date, "time", location, categoria, status, owner_id, created_at) FROM stdin;
1	Vasco da Gama	2025-06-19 20:30:00	\N	São Januário	\N	FINALIZADA	1	2025-06-19 20:20:15.848699
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.leads (id, nome, email, whatsapp, created_at) FROM stdin;
1	Joaozinho	patrick.amartins@gmail.com	(61) 98155-7959	2025-06-19 23:10:32.576538
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.notifications (id, content, url, target, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.players (id, name, number, "position", categoria, active, created_at) FROM stdin;
1	Patrick Martins	2	Ala	\N	t	2025-06-19 20:20:15.848699
\.


--
-- Data for Name: statistics; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.statistics (id, game_id, player_id, points, rebounds, assists, steals, blocks, fouls, minutes_played, quarter, created_at, updated_at, two_attempts, two_made, three_attempts, three_made, free_throw_attempts, free_throw_made, interference) FROM stdin;
1	1	1	5	0	2	2	0	0	0	1	2025-06-19 23:43:45.106351	2025-06-19 23:43:45.106354	1	1	1	1	0	0	0
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.user_notifications (id, user_id, notification_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, name, email, hashed_password, role, is_active, created_at, updated_at, plan, stripe_customer_id, stripe_subscription_id, last_payment_date, next_payment_date, card_last4, card_brand, profile_image, phone, cpf, favorite_team, playing_team) FROM stdin;
1	Administrador	admin@scoremvp.com.br	$2b$12$SVPxWUiAJQO3GCkvbnLPFODJQ7gWb79xzSraecISpq9EAlH0PVfyq	SUPERADMIN	t	2025-06-19 23:20:18.173202	2025-06-19 23:20:18.173206	TEAM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.games_id_seq', 1, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.leads_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.players_id_seq', 1, true);


--
-- Name: statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.statistics_id_seq', 1, true);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.user_notifications_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: statistics statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_pkey PRIMARY KEY (id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_games_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_games_id ON public.games USING btree (id);


--
-- Name: ix_leads_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_leads_id ON public.leads USING btree (id);


--
-- Name: ix_notifications_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);


--
-- Name: ix_players_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_players_id ON public.players USING btree (id);


--
-- Name: ix_statistics_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_statistics_id ON public.statistics USING btree (id);


--
-- Name: ix_user_notifications_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_user_notifications_id ON public.user_notifications USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: game_player game_player_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.game_player
    ADD CONSTRAINT game_player_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- Name: game_player game_player_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.game_player
    ADD CONSTRAINT game_player_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: games games_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: statistics statistics_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- Name: statistics statistics_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.statistics
    ADD CONSTRAINT statistics_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: user_notifications user_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id);


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

