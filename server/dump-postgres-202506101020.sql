--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-10 10:20:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 16487)
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    trip_id integer,
    creator_id integer,
    companion_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16486)
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_id_seq OWNER TO postgres;

--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 227
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- TOC entry 218 (class 1259 OID 16389)
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.cities OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16388)
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO postgres;

--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 217
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- TOC entry 230 (class 1259 OID 16510)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    chat_id integer,
    sender_id integer,
    content text NOT NULL,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16509)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 229
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 232 (class 1259 OID 16531)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50),
    related_trip_id integer,
    related_user_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16530)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 231
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 236 (class 1259 OID 16568)
-- Name: review_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_photos (
    id integer NOT NULL,
    review_id integer,
    photo_url character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.review_photos OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16567)
-- Name: review_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_photos_id_seq OWNER TO postgres;

--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 235
-- Name: review_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_photos_id_seq OWNED BY public.review_photos.id;


--
-- TOC entry 234 (class 1259 OID 16546)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    trip_id integer,
    user_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16545)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 233
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 226 (class 1259 OID 16466)
-- Name: trip_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_participants (
    id integer NOT NULL,
    trip_id integer,
    user_id integer,
    role character varying(10),
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trip_participants_role_check CHECK (((role)::text = ANY ((ARRAY['creator'::character varying, 'companion'::character varying])::text[])))
);


ALTER TABLE public.trip_participants OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16465)
-- Name: trip_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_participants_id_seq OWNER TO postgres;

--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 225
-- Name: trip_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_participants_id_seq OWNED BY public.trip_participants.id;


--
-- TOC entry 224 (class 1259 OID 16445)
-- Name: trip_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_requests (
    id integer NOT NULL,
    trip_id integer,
    user_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trip_requests OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16444)
-- Name: trip_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_requests_id_seq OWNER TO postgres;

--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 223
-- Name: trip_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_requests_id_seq OWNED BY public.trip_requests.id;


--
-- TOC entry 222 (class 1259 OID 16419)
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id integer NOT NULL,
    creator_id integer,
    from_city_id integer,
    to_city_id integer,
    date_from date NOT NULL,
    date_to date NOT NULL,
    description text,
    companion_description text,
    preferred_gender character varying(10),
    preferred_age_min integer,
    preferred_age_max integer,
    interests text[],
    status character varying(20) DEFAULT 'searching'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16418)
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO postgres;

--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 221
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- TOC entry 220 (class 1259 OID 16402)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    city_id integer,
    age integer,
    gender character varying(10),
    description text,
    interests text[],
    avatar_url text,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    avatar character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16401)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4697 (class 2604 OID 16490)
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- TOC entry 4686 (class 2604 OID 16392)
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- TOC entry 4699 (class 2604 OID 16513)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4701 (class 2604 OID 16534)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4707 (class 2604 OID 16571)
-- Name: review_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_photos ALTER COLUMN id SET DEFAULT nextval('public.review_photos_id_seq'::regclass);


--
-- TOC entry 4704 (class 2604 OID 16549)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4695 (class 2604 OID 16469)
-- Name: trip_participants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_participants ALTER COLUMN id SET DEFAULT nextval('public.trip_participants_id_seq'::regclass);


--
-- TOC entry 4692 (class 2604 OID 16448)
-- Name: trip_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_requests ALTER COLUMN id SET DEFAULT nextval('public.trip_requests_id_seq'::regclass);


--
-- TOC entry 4689 (class 2604 OID 16422)
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- TOC entry 4687 (class 2604 OID 16405)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4913 (class 0 OID 16487)
-- Dependencies: 228
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, trip_id, creator_id, companion_id, created_at) FROM stdin;
1	8	3	4	2025-06-04 12:40:51.996957
2	11	3	5	2025-06-04 14:21:40.360754
3	12	4	5	2025-06-06 08:00:03.696512
4	8	3	5	2025-06-06 09:29:27.455715
5	10	3	4	2025-06-06 09:37:14.403577
6	14	6	4	2025-06-06 13:00:43.401074
\.


--
-- TOC entry 4903 (class 0 OID 16389)
-- Dependencies: 218
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, name) FROM stdin;
1	Минск
2	Брест
3	Гродно
4	Витебск
5	Гомель
6	Могилёв
7	Барановичи
8	Мозырь
9	Пинск
10	Бобруйск
11	Орша
12	Новополоцк
13	Полоцк
14	Солигорск
15	Жлобин
16	Лида
17	Молодечно
18	Слуцк
19	Светлогорск
20	Речица
\.


--
-- TOC entry 4915 (class 0 OID 16510)
-- Dependencies: 230
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, chat_id, sender_id, content, sent_at) FROM stdin;
1	1	3	Привет! какие планы на поездку?	2025-06-04 13:33:13.947949
2	1	4	Привет, еще думаю	2025-06-04 13:37:24.716559
3	1	3	:)	2025-06-04 13:41:15.831212
4	1	3	;))	2025-06-04 13:58:18.764294
5	2	3	ривет	2025-06-04 14:22:01.500325
6	1	3	1111	2025-06-05 21:25:02.804043
7	5	3	Привет! какие планы на поездку?	2025-06-06 12:52:43.254462
8	6	6	Привет, готов в поход?	2025-06-06 13:01:15.257158
9	6	4	Конечно, что с собой брать?	2025-06-06 13:01:48.46342
\.


--
-- TOC entry 4917 (class 0 OID 16531)
-- Dependencies: 232
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, related_trip_id, related_user_id, is_read, created_at) FROM stdin;
1	3	join_request	8	4	f	2025-06-04 12:03:26.912239
2	2	join_request	4	3	f	2025-06-04 12:04:07.725653
3	2	join_request	7	4	f	2025-06-04 12:07:59.36568
4	2	join_request	7	3	f	2025-06-04 12:21:02.224779
5	3	join_request	9	4	f	2025-06-04 12:42:08.508383
6	3	join_request	10	4	f	2025-06-04 12:48:30.251428
7	2	join_request	6	3	f	2025-06-04 13:42:47.070159
8	3	join_request	8	5	f	2025-06-04 14:10:09.192979
9	3	join_request	11	5	f	2025-06-04 14:21:22.453575
10	4	join_request	12	5	f	2025-06-06 07:59:53.588295
11	6	join_request	14	4	f	2025-06-06 12:59:23.146053
12	6	join_request	13	3	f	2025-06-07 08:27:16.965131
13	6	join_request	13	5	f	2025-06-07 08:27:29.949775
\.


--
-- TOC entry 4921 (class 0 OID 16568)
-- Dependencies: 236
-- Data for Name: review_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_photos (id, review_id, photo_url, created_at) FROM stdin;
\.


--
-- TOC entry 4919 (class 0 OID 16546)
-- Dependencies: 234
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, trip_id, user_id, title, content, rating, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4911 (class 0 OID 16466)
-- Dependencies: 226
-- Data for Name: trip_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_participants (id, trip_id, user_id, role, joined_at) FROM stdin;
1	8	4	companion	2025-06-04 12:40:51.993051
2	11	5	companion	2025-06-04 14:21:40.358784
3	12	5	\N	2025-06-06 08:00:03.694569
4	8	5	\N	2025-06-06 09:29:27.452203
5	10	4	\N	2025-06-06 09:37:14.400115
6	14	4	\N	2025-06-06 13:00:43.394978
\.


--
-- TOC entry 4909 (class 0 OID 16445)
-- Dependencies: 224
-- Data for Name: trip_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_requests (id, trip_id, user_id, status, created_at) FROM stdin;
2	4	3	pending	2025-06-04 12:04:07.714767
3	7	4	pending	2025-06-04 12:07:59.355169
4	7	3	pending	2025-06-04 12:21:02.214882
1	8	4	accepted	2025-06-04 12:03:26.907909
5	9	4	rejected	2025-06-04 12:42:08.498764
7	6	3	pending	2025-06-04 13:42:47.013537
9	11	5	accepted	2025-06-04 14:21:22.444145
10	12	5	accepted	2025-06-06 07:59:53.578077
8	8	5	accepted	2025-06-04 14:10:09.19004
6	10	4	accepted	2025-06-04 12:48:30.239741
11	14	4	accepted	2025-06-06 12:59:23.13593
12	13	3	pending	2025-06-07 08:27:16.945436
13	13	5	pending	2025-06-07 08:27:29.940425
\.


--
-- TOC entry 4907 (class 0 OID 16419)
-- Dependencies: 222
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, creator_id, from_city_id, to_city_id, date_from, date_to, description, companion_description, preferred_gender, preferred_age_min, preferred_age_max, interests, status, created_at) FROM stdin;
4	2	1	2	2025-06-15	2025-06-20	Поездка в Брест, хочу посмотреть крепость и просто отдохнуть.	Ищу весёлого попутчика, который любит историю.	female	20	30	{история,музеи}	searching	2025-06-01 05:09:58.965114
5	2	2	3	2025-07-01	2025-07-10	Отдых в Гродно на неделю.	Можно ехать вдвоём или втроём.	any	18	35	{прогулки,кафе,разговоры}	searching	2025-06-01 05:09:58.965114
6	2	3	4	2025-06-25	2025-06-28	Быстрый трип в Витебск на фестиваль.	Ищу человека, который любит музыку.	male	22	30	{музыка,фестивали,фото}	searching	2025-06-01 05:09:58.965114
7	2	7	10	2025-06-14	2025-06-21	бобруйск.....	веселый	мужской	18	25	{природа,архитектура}	searching	2025-06-01 06:08:33.966618
11	3	10	10	2025-06-14	2025-06-15	..	..		20	24	{}	completed	2025-06-04 14:20:45.855415
12	4	4	5	2025-06-08	2025-06-20	..	..	женщина	30	33	{}	planned	2025-06-06 07:59:06.187033
8	3	10	2	2025-06-05	2025-06-20	.	.	женский	30	40	{qwertyui,qwerty6}	planned	2025-06-02 12:22:50.107118
10	3	10	7	2025-06-01	2025-06-14	..иииииииииии\nииииии ииииии иииииии \nииииии ииииииии иииииииииии иииииииииииииии иииииииииииии ииииииииии \n иии иииии иии иии иии иии	..		20	25	{}	planned	2025-06-04 12:48:07.426416
13	6	4	16	2025-07-20	2025-07-27	Ищу компанию на фестиваль и неделю отдыха в Лиде	Общительный, легкий на подъем	мужчина	35	45	{музыка,"активный отдых",рабылка}	searching	2025-06-06 12:39:45.035187
9	3	13	3	2025-06-22	2025-06-23	Планирую уикенд в Гродно с посещением старинных замков и уютных кафе. Хочу посетить самые живописные места — Старый замок, Новый замок, Фарный костел и набережную Немана. Остановимся в симпатичном бутик-отеле в центре. Готова разделить расходы на проживание и питание.	Ищу девушку, любящую историю. Важно некурящую, с хорошим чувством юмора и любовью к фотографии. Готова к неспешным прогулкам и душевным разговорам.	женщина	25	30	{}	searching	2025-06-04 10:23:35.87546
14	6	4	10	2025-06-27	2025-06-29	Затеваю 3-дневный поход с палатками по Браславским озерам. Маршрут: рыбалка на рассвете, радиальные выходы к самым диким пляжам, ночевка у костра. У меня есть все необходимое снаряжение (2 палатки, газовая горелка). Нужен компаньон для разделения нагрузки и приятной компании.	Ищу мужчину с опытом походов. Важно: выносливость, ответственность, отсутствие вредных привычек. Приветствуются навыки ориентирования на местности. Должен уметь нести рюкзак 15+ кг и не бояться спать в палатке.	мужчина	25	45	{походы,"активный отдых","дикая природа",рыбалка}	planned	2025-06-06 12:56:44.857721
\.


--
-- TOC entry 4905 (class 0 OID 16402)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, city_id, age, gender, description, interests, avatar_url, email, password_hash, created_at, avatar) FROM stdin;
1	Тестовый пользователь	\N	\N	\N	\N	\N	\N	test@mail.com	123	2025-05-30 11:30:31.799474	\N
2	Аня	1	21	female	\N	\N	\N	anya@example.com	$2b$10$xNz15XyGqp/to7B9sIN7n..LJUtVCQsrnd.eh438aMRfTveFeCkVi	2025-05-30 11:46:55.497029	\N
3	Елена	2	30	female	Надежная, адекватная, легкая в общении, часто путешествую	\N		elena@mail.ru	$2b$10$ZyRtkOKbqwJinZxeeGMx1upSSCQHYDEFX7mUnKX2zz1P0AdZZeBCO	2025-06-02 11:57:39.778984	/avatars/1749024971979-3.jpg
4	Дмитрий	1	20	male		\N	\N	dima@mail.ru	$2b$10$OTq5600e8WQcvVx/v9xa2.rGKnt6H7LYM48yX2buUIFDK8Yrp6sEW	2025-06-04 12:02:53.741209	\N
5	Алина	5	26	female		\N	\N	alya@mail.ru	$2b$10$Ykyxuz40X2HLKM.We.dzZ.LRi6OA7cB9LeOTsrODX7wlT9VtplqlC	2025-06-04 14:09:35.660631	\N
6	Евгений	4	40	male		\N	\N	jeny@mail.ru	$2b$10$UAVyKA9sGjx67eQzWYuLyOidLELTsEinW0XFuq1JPr/NWHl9B1IcW	2025-06-06 12:33:23.430976	/avatars/1749202499365-6.jpg
\.


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 227
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 6, true);


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 217
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cities_id_seq', 21, true);


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 229
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 9, true);


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 231
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 13, true);


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 235
-- Name: review_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_photos_id_seq', 1, false);


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 233
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 225
-- Name: trip_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_participants_id_seq', 6, true);


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 223
-- Name: trip_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_requests_id_seq', 13, true);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 221
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_id_seq', 14, true);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 4731 (class 2606 OID 16493)
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- TOC entry 4712 (class 2606 OID 16398)
-- Name: cities cities_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_key UNIQUE (name);


--
-- TOC entry 4714 (class 2606 OID 16396)
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 16519)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4735 (class 2606 OID 16538)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4739 (class 2606 OID 16574)
-- Name: review_photos review_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_photos
    ADD CONSTRAINT review_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4737 (class 2606 OID 16556)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 16473)
-- Name: trip_participants trip_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_participants
    ADD CONSTRAINT trip_participants_pkey PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 16475)
-- Name: trip_participants trip_participants_trip_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_participants
    ADD CONSTRAINT trip_participants_trip_id_user_id_key UNIQUE (trip_id, user_id);


--
-- TOC entry 4723 (class 2606 OID 16452)
-- Name: trip_requests trip_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_requests
    ADD CONSTRAINT trip_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4725 (class 2606 OID 16454)
-- Name: trip_requests trip_requests_trip_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_requests
    ADD CONSTRAINT trip_requests_trip_id_user_id_key UNIQUE (trip_id, user_id);


--
-- TOC entry 4721 (class 2606 OID 16428)
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 16412)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4719 (class 2606 OID 16410)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4715 (class 1259 OID 16544)
-- Name: idx_users_avatar; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_avatar ON public.users USING btree (avatar);


--
-- TOC entry 4748 (class 2606 OID 16504)
-- Name: chats chats_companion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_companion_id_fkey FOREIGN KEY (companion_id) REFERENCES public.users(id);


--
-- TOC entry 4749 (class 2606 OID 16499)
-- Name: chats chats_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- TOC entry 4750 (class 2606 OID 16494)
-- Name: chats chats_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- TOC entry 4751 (class 2606 OID 16520)
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- TOC entry 4752 (class 2606 OID 16525)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 4753 (class 2606 OID 16539)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4756 (class 2606 OID 16575)
-- Name: review_photos review_photos_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_photos
    ADD CONSTRAINT review_photos_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- TOC entry 4754 (class 2606 OID 16557)
-- Name: reviews reviews_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);


--
-- TOC entry 4755 (class 2606 OID 16562)
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4746 (class 2606 OID 16476)
-- Name: trip_participants trip_participants_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_participants
    ADD CONSTRAINT trip_participants_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- TOC entry 4747 (class 2606 OID 16481)
-- Name: trip_participants trip_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_participants
    ADD CONSTRAINT trip_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4744 (class 2606 OID 16455)
-- Name: trip_requests trip_requests_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_requests
    ADD CONSTRAINT trip_requests_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- TOC entry 4745 (class 2606 OID 16460)
-- Name: trip_requests trip_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_requests
    ADD CONSTRAINT trip_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4741 (class 2606 OID 16429)
-- Name: trips trips_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4742 (class 2606 OID 16434)
-- Name: trips trips_from_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_from_city_id_fkey FOREIGN KEY (from_city_id) REFERENCES public.cities(id);


--
-- TOC entry 4743 (class 2606 OID 16439)
-- Name: trips trips_to_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_to_city_id_fkey FOREIGN KEY (to_city_id) REFERENCES public.cities(id);


--
-- TOC entry 4740 (class 2606 OID 16413)
-- Name: users users_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


-- Completed on 2025-06-10 10:20:09

--
-- PostgreSQL database dump complete
--

