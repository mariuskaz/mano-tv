import React, { useState, useEffect, useLayoutEffect } from 'react'
import './App.css'
import { channels } from './channels'

const epg_link = 'https://www.open-epg.com/files/lithuania3.xml'
const newsFeeds = [
	{ source: 'LRT', url: 'https://www.lrt.lt/?rss=' },
	{ source: 'DELFI', url: 'https://feed.delfi.lt/v2/channel/global-lt?format=rss' },
	{ source: 'lrytas.lt', url: 'https://www.lrytas.lt/rss' },
	{ source: '15min', url: 'https://www.15min.lt/rss' },
]

export function buildProxyUrl(targetUrl) {
    return `/api/proxy?url=${encodeURIComponent(targetUrl)}`
}

export function parseDate(d) {
	const year = +d.slice(0, 4)
	const month = +d.slice(4, 6)
	const day = +d.slice(6, 8)
	const h = +d.slice(8, 10)
	const m = +d.slice(10, 12)
	const offset = new Date().getTimezoneOffset() / 60
	return new Date(year, month - 1, day, h - offset, m)
}

function decodeHtmlEntities(value) {
	const document = new DOMParser().parseFromString(value, 'text/html')
	return document.documentElement.textContent || ''
}

function Label({value}) {
	return <span className='float-label'>{value}</span>
}

function Loader() {
	return <div className="loader" />
}

function Toast({message, button, action}) {
	const [dismissed, setDismissed] = useState(false)
	if (dismissed) return null

	return (
		<div className='toast'>
			<span>{message}</span>
			<span className='toast-button' onClick={action}>{button}</span>
			<button className='toast-close' type='button' aria-label='Uždaryti pranešimą' onClick={() => setDismissed(true)}>&times;</button>
		</div>
	)
}

function Channel({channel, epg}) {
    const { now, progress, next } = epg[channel.id] || {}
    const handleClick = () => window.open(channel.url, '_blank', 'noopener, noreferrer')
    return (
        <div className='channel' onClick={handleClick}>
            <div className='logo'><img src={channel.logo} alt="logo" />{channel.name}</div>
            <div className='content'>
                <div>{now}</div>
                <progress className='progress' value={progress} max={100} />
                <div style={{ color: 'darkgrey' }}>{next}</div>
            </div>
        </div>
    )
}

function Channels({epg}) {
	return (
		<div className='channels-list'>
			{channels.map(channel => (
				<Channel key={channel.id} channel={channel} epg={epg} />
			))}
		</div>
	)
}

const gameDateFormatter = new Intl.DateTimeFormat('lt-LT', {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
})

function isBasketballBroadcast(title, description, category) {
	const text = `${title} ${description} ${category}`
	const league = /(eurolyga|euroleague|\blkl\b|lietuvos krepšinio lyga|betsafe[- ]?lkl|betsson[- ]?lkl)/i
	const review = /(apžvalga|žurnalas|magazinas|studija|dienoraštis|savaitė|top 10)/i
	return league.test(text) && !review.test(title)
}

function GamesGroup({title, games, loading}) {
	return (
		<section className='games-section'>
			<div className='games-heading'>
				<span className='basketball-icon' aria-hidden='true'><span className='pulse-dot' /></span>
				<h2>{title}</h2>
			</div>
			{games.length > 0 ? (
				<div className='games-list'>
					{games.map(game => (
						<article className='game-card' key={`${game.channelId}-${game.start.toISOString()}-${game.title}`}>
							<div className='game-meta'>
								<span className='game-league'>{game.league}</span>
								<time dateTime={game.start.toISOString()}>{gameDateFormatter.format(game.start)}</time>
							</div>
							<div className='game-title'>{game.title}</div>
							<div className='game-channel'>{game.channelName}</div>
						</article>
					))}
				</div>
			) : !loading ? (
				<p className='games-empty'>Artimiausioje TV programoje rungtynių nerasta.</p>
			) : null}
		</section>
	)
}

function UpcomingGames({games, loading}) {
	if (games.length === 0) return null

	return (
		<div className='upcoming-games'>
			<GamesGroup title='Artimiausios rungtynės' games={games.slice(0, 6)} loading={loading} />
		</div>
	)
}

const newsDateFormatter = new Intl.DateTimeFormat('lt-LT', {
	month: 'short',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
})

function UpcomingGameStrip({game}) {
	if (!game) return null

	return (
		<article className='featured-game'>
			<div className='featured-game-label'>
				<span className='pulse-dot' aria-hidden='true' />
				<span>Artimiausios rungtynės</span>
			</div>
			<div className='featured-game-main'>
				<span className='featured-game-title'>{game.title}</span>
			</div>
			<div className='featured-game-details'>
				<time dateTime={game.start.toISOString()}>{gameDateFormatter.format(game.start)}</time>
				<span className='featured-game-channel'>{game.channelName}</span>
			</div>
		</article>
	)
}

function NewsSection({news, status, games}) {
	return (
		<section className='news-section'>
			<div className='news-heading'>
				<span className='news-icon' aria-hidden='true'>
					<svg viewBox='0 0 24 24'>
						<circle cx='6' cy='18' r='1.5' />
						<path d='M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14' />
					</svg>
				</span>
				<h2>Naujausios žinios</h2>
			</div>
			<UpcomingGameStrip game={games[0]} />
			{news.length > 0 ? (
				<div className='news-list'>
					{news.map(item => (
						<a className='news-card' href={item.link} target='_blank' rel='noopener noreferrer' key={item.link}>
							{item.image && <img className='news-image' src={item.image} alt='' loading='lazy' />}
							<div className='news-content'>
							<div className='news-meta'>
								<span className='news-source'>{item.source}</span>
								{item.publishedAt && <time dateTime={item.publishedAt.toISOString()}>{newsDateFormatter.format(item.publishedAt)}</time>}
							</div>
							<div className='news-title'>{item.title}</div>
							</div>
						</a>
					))}
				</div>
			) : status === 'error' ? (
				<p className='news-empty'>Naujienų šiuo metu nepavyko gauti.</p>
			) : status === 'ready' ? (
				<p className='news-empty'>Naujienų nerasta.</p>
			) : null}
		</section>
	)
}
export default function App() {
	const [guide, setGuide] = useState({})
	const [games, setGames] = useState([])
	const [news, setNews] = useState([])
	const [newsStatus, setNewsStatus] = useState('loading')
	const [items, setItems] = useState(-1)
	const [updated, setUpdated] = useState(false)
	const [synced, setSynced] = useState(false)

	const isLoading = items === -1;
	const hasError = items === 0 && synced;
	const isOutdated = items > 0 && items < channels.length && synced;

	const fetchGuide = async () => {
		try {
			const res = await fetch(buildProxyUrl(epg_link))
			const text = await res.text()
			localStorage.setItem("epg", text)
			setSynced(true)
			setUpdated(false)
		} catch (err) {
			console.error("EPG fetch error:", err)
			setItems(0)
		}
  	}

	useEffect(() => {
		const epgText = localStorage.getItem('epg')

		const loadGuide = async () => {
			if (!epgText) {
				await fetchGuide()
				return
			}

			const parser = new DOMParser()
			const xml = parser.parseFromString(epgText, "application/xml")
			const programs = xml.getElementsByTagName("programme")
			const now = new Date()
			let epg = {}, count = 0, upcomingGames = []

			for (let program of programs) {
				const channelId = program.getAttribute("channel")
				if (!channels.find(c => c.id === channelId)) continue

				const start = parseDate(program.getAttribute("start"))
				const stop = parseDate(program.getAttribute("stop"))
				const title = program.getElementsByTagName("title")[0]?.textContent || ""
				const description = program.getElementsByTagName("desc")[0]?.textContent || ""
				const category = program.getElementsByTagName("category")[0]?.textContent || ""
				const horizon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

				if (start >= now && start <= horizon && isBasketballBroadcast(title, description, category)) {
					const channel = channels.find(c => c.id === channelId)
					upcomingGames.push({
						channelId,
						channelName: channel?.name || channelId,
						start,
						title,
						league: /\blkl\b|lietuvos krepšinio lyga|betsafe[- ]?lkl|betsson[- ]?lkl/i.test(`${title} ${description}`) ? 'LKL' : 'Eurolyga',
					})
				}

				if (!epg[channelId]) epg[channelId] = { now: "", stop: new Date(0), next: "", progress: 0 }

				if (start <= now && stop >= now) {
					epg[channelId].now = `${start.toLocaleTimeString().slice(0, 5)} ${title}`
					epg[channelId].progress = ((now - start) * 100) / (stop - start)
					epg[channelId].stop = stop
					count++
				} else if (start >= now && (epg[channelId].nextStart === undefined || start < epg[channelId].nextStart)) {
					epg[channelId].next = `${start.toLocaleTimeString().slice(0, 5)} ${title}`
					epg[channelId].nextStart = start
				}
			}

			if (count !== channels.length && !synced) {
				await fetchGuide()
				return
			}

			setGuide(epg)
			upcomingGames.sort((a, b) => a.start - b.start)
			setGames(upcomingGames)
			setItems(count)
			setUpdated(true)
		}

		void loadGuide()
	}, [updated, synced])

	useEffect(() => {
		let active = true

		const loadNews = async () => {
			try {
				const results = await Promise.allSettled(newsFeeds.map(async feed => {
					const response = await fetch(buildProxyUrl(feed.url))
					if (!response.ok) throw new Error(`${feed.source} news request failed: ${response.status}`)
					const text = await response.text()
					const xml = new DOMParser().parseFromString(text, 'application/xml')
					return Array.from(xml.getElementsByTagName('item')).map(item => {
						const rawTitle = item.getElementsByTagName('title')[0]?.textContent?.trim() || ''
						const title = decodeHtmlEntities(rawTitle)
						const rssLink = item.getElementsByTagName('link')[0]?.textContent?.trim() || ''
						const guid = item.getElementsByTagName('guid')[0]?.textContent?.trim() || ''
						const link = feed.source === 'DELFI'
							? [guid, rssLink].find(url => /^https?:\/\/(www\.)?delfi\.lt\//i.test(url)) || ''
							: rssLink
						const mediaContent = item.getElementsByTagName('media:content')[0]?.getAttribute('url') || ''
						const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0]?.getAttribute('url') || ''
						const enclosure = Array.from(item.getElementsByTagName('enclosure'))
							.find(node => node.getAttribute('type')?.startsWith('image/'))?.getAttribute('url') || ''
						const description = item.getElementsByTagName('description')[0]?.textContent || ''
						const descriptionImage = description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || ''
						const image = mediaContent || mediaThumbnail || enclosure || descriptionImage
						const published = item.getElementsByTagName('pubDate')[0]?.textContent?.trim()
						const publishedAt = published ? new Date(published) : null
						return {
							source: feed.source,
							title,
							link,
							image,
							publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
						}
					}).filter(item => item.title && item.link)
				}))

				const successfulFeeds = results.filter(result => result.status === 'fulfilled')
				if (successfulFeeds.length === 0) throw new Error('All news requests failed')

				const items = successfulFeeds
					.flatMap(result => result.value
						.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
						.slice(0, 1))
					.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))

				if (active) {
					setNews(items)
					setNewsStatus('ready')
				}
			} catch (error) {
				console.error('News fetch error:', error)
				if (active) setNewsStatus('error')
			}
		}

		void loadNews()
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') void loadNews()
		}
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			active = false
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [])
	useLayoutEffect(() => {
		const handler = () => document.visibilityState === 'visible' && setUpdated(false)
		document.addEventListener("visibilitychange", handler)
		return () => document.removeEventListener("visibilitychange", handler)
	}, [])

	return (
        <>
            <header>TV programa <Label value={channels.length} /></header>
            <div className='now-showing'>
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                    <rect x='3' y='4' width='18' height='13' rx='2' />
                    <path d='M8 21h8M12 17v4' />
                </svg>
                <span>Dabar rodoma</span>
            </div>
            <Channels epg={guide} />
            <NewsSection news={news} status={newsStatus} games={games} />
            {isLoading && <Loader />}
            {hasError && <Toast message="Error fetching EPG data!" button="Retry" action={() => setSynced(false)} />}
            {isOutdated && <Toast message="EPG is outdated!" button="Update" action={() => setSynced(false)} />}
        </>
	)
}
