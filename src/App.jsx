import React, { useState, useEffect, useLayoutEffect } from 'react'
import './App.css'
import { channels } from './channels'

const epg_link = 'https://www.open-epg.com/files/lithuania3.xml'

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

function Label({value}) {
	return <span className='float-label'>{value}</span>
}

function Loader() {
	return <div className="loader" />
}

function Toast({message, button, action}) {
	return (
		<div className='toast'>
			{message}
			<span className='toast-button' onClick={action}>{button}</span>
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

export default function App() {
	const [guide, setGuide] = useState({})
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
		} catch (err) {
			console.error("EPG fetch error:", err)
			setItems(0)
		}
  	}

	useEffect(() => {
		const epgText = localStorage.getItem('epg')
		if (!epgText) return fetchGuide()

		const parser = new DOMParser()
		const xml = parser.parseFromString(epgText, "application/xml")
		const programs = xml.getElementsByTagName("programme")
		const now = new Date()
		let epg = {}, count = 0

		for (let program of programs) {
			const channelId = program.getAttribute("channel")
			if (!channels.find(c => c.id === channelId)) continue

			const start = parseDate(program.getAttribute("start"))
			const stop = parseDate(program.getAttribute("stop"))
			const title = program.getElementsByTagName("title")[0]?.textContent || ""

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

		if (count !== channels.length && !synced) return fetchGuide()

		setGuide(epg)
		setItems(count)
		setUpdated(true)
		
	}, [updated, synced])

	useLayoutEffect(() => {
		const handler = () => document.visibilityState === 'visible' && setUpdated(false)
		document.addEventListener("visibilitychange", handler)
		return () => document.removeEventListener("visibilitychange", handler)
	}, [])

	return (
        <>
            <header>TV programa <Label value={channels.length} /></header>
            <Channels epg={guide} />
            {isLoading && <Loader />}
            {hasError && <Toast message="Error fetching EPG data!" button="Retry" action={() => setSynced(false)} />}
            {isOutdated && <Toast message="EPG is outdated!" button="Update" action={() => setSynced(false)} />}
        </>
	)
}
