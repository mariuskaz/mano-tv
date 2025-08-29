import React, { useState, useEffect, useLayoutEffect } from 'react'
import './App.css'

const epg_link = 'https://www.open-epg.com/files/lithuania3.xml'
const proxy_url = `https://api.codetabs.com/v1/proxy?quest=${epg_link}`

const channels = [
  {
    id: "LRT Televizija.lt",
    url: "https://www.lrt.lt/mediateka/tiesiogiai/lrt-televizija",
    logo: "https://www.lrt.lt/images/logo/logo-lrt.svg?v=673",
    name: "LRT",
	  preview: true,
	  delay: 3500,
  },
  {
    id: "LNK.lt",
    url: "https://lnk.lt/video-embed/ad1a0439-7a2c-47d8-80c8-cf9b6b6a2f76/lnk-hd-kanalas-internetu?muteOnStart=true&autoStart=true&startFrom=undefined",
    logo: "https://content.tvprograma.lt/logo/220x80_0_88847800_1536058587m.png",
    name: "LNK",
	  preview: true,
  },
  {
    id: "TV3.lt",
    url: "https://play.tv3.lt/lives/tv3-lt,live-2831094",
    logo: "https://www.programatv.lt/images/channels/03.png?v=1",
    name: "TV3",
	  preview: false,
  },
  {
    id: "BTV.lt",
    url: "https://lnk.lt/video-embed/1327f096-ea77-41b6-9913-b4d848fa2058/btv-hd-kanalas-internetu?muteOnStart=true&autoStart=true&startFrom=undefined",
    logo: "https://content.tvprograma.lt/logo/220x80_0_99643600_1536832966m.png",
    name: "BTV",
	  preview: true,
  },
  {
    id: "TV1.lt",
    url: "https://lnk.lt/tiesiogiai#tv1",
    logo: "https://content.tvprograma.lt/logo/220x80_0_50644700_1415689122m.png",
    name: "TV1",
	  preview: false,
  },
  {
    id: "2TV.lt",
    url: "https://lnk.lt/video-embed/e1faa68a-70e5-4ead-80c3-05f88ff9c745/2tv-hd-kanalas-internetu?muteOnStart=true&autoStart=true&startFrom=undefined",
    logo: "https://content.tvprograma.lt/logo/220x80_0_88998600_1585550605m.png",
    name: "2TV",
	  preview: true,
  },
  {
    id: "TV6.lt",
    url: "https://play.tv3.lt/live/tv6-lt,live-2838694",
    logo: "https://content.tvprograma.lt/logo/220x80_0_98820800_1665328884m.jpg",
    name: "TV6",
	  preview: false,
  },
  {
    id: "Lietuvos ryto TV.lt",
    url: "https://www.lietuvosryto.tv/eteris",
    logo: "https://content.tvprograma.lt/logo/220x80_0_80098400_1538461908m.png",
    name: "Lietuvos rytas",
	  preview: false,
  },
  {
    id: "LRT Plius.lt",
    url: "https://www.lrt.lt/mediateka/tiesiogiai/lrt-plius",
    logo: "https://content.tvprograma.lt/logo/220x80_0_91824600_1652106605m.jpg",
    name: "LRT PLIUS",
    preview: true,
    delay: 3500,
  },
  {
    id: "Info TV.lt",
    url: "https://lnk.lt/tiesiogiai#infotv",
    logo: "https://content.tvprograma.lt/logo/220x80_0_34085600_1418495360m.png",
    name: "Info TV",
	  preview: false,
  },
  {
    id: "Delfi TV.lt",
    url: "https://www.delfi.lt/video/puslapis/tv",
    logo: "https://content.tvprograma.lt/logo/220x80_0_11928400_1633001331m.png",
    name: "Delfi",
	  preview: false,
  },
  {
    id: "TV3 Plus.lt",
    url: "https://play.tv3.lt/show/tv3-plus,live-4929289",
    logo: "https://content.tvprograma.lt/logo/220x80_0_37190500_1654152447m.png",
    name: "TV3 PLUS",
	  preview: false,
  },
]

function parseDate(d) {
	const year = +d.slice(0, 4)
	const month = +d.slice(4, 6)
	const day = +d.slice(6, 8)
	const h = +d.slice(8, 10)
	const m = +d.slice(10, 12)
	const offset = new Date().getTimezoneOffset() / 60
	return new Date(year, month - 1, day, h - offset, m)
}

function Label({ value }) {
	return <span className='float-label'>{value}</span>
}

function Loader() {
	return <div className="loader" />
}

function Toast({ message, button, action }) {
	return (
		<div className='toast'>
			{message}
			<span className='toast-button' onClick={action}>{button}</span>
		</div>
	)
}

function Channel({ channel, epg, onSelect }) {
    const { now, progress, next } = epg[channel.id] || {}
    const handleClick = () => {
        if (channel.preview === false) {
			onSelect(null)
            window.open(channel.url, '_blank', 'noopener, noreferrer')
        } else {
            onSelect(channel.url)
        }
    }
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

function Channels({ epg, onSelect }) {
	return (
		<div className='channels-list'>
			{channels.map(channel => (
				<Channel key={channel.id} channel={channel} epg={epg} onSelect={onSelect} />
			))}
		</div>
	)
}

function estimateNetworkSpeed(callback) {
    const testImage = new Image();
    const startTime = Date.now();
    const cacheBuster = "?nn=" + Math.random();
    testImage.src = "https://www.google.com/images/phd/px.gif" + cacheBuster;
    testImage.onload = () => {
        const duration = (Date.now() - startTime) / 1000; // seconds
        const sizeBits = 800 * 8; // px.gif is about 800 bytes
        const speedKbps = sizeBits / duration / 1024;
        callback(speedKbps);
    };
    testImage.onerror = () => callback(null);
}

function Preview({ url, onClose }) {
    const [visible, setVisible] = useState(true)
    const [extraDelay, setExtraDelay] = useState(0)
    const channel = channels.find(c => c.url === url)
    const delay = channel?.delay || 0

    useEffect(() => {
        estimateNetworkSpeed(speed => {
            let add = 0;
            if (speed && speed < 100) add = 2000; // if <100kbps, add 2s
            setExtraDelay(add);
        });
    }, [url]);

    useEffect(() => {
        if (delay + extraDelay > 0) {
            setVisible(false)
            const timer = setTimeout(() => setVisible(true), delay + extraDelay)
            return () => clearTimeout(timer)
        } else {
            setVisible(true)
        }
    }, [url, delay, extraDelay])

    const visibility = { visibility: visible ? 'visible' : 'hidden' }

    return (
        <div className="preview">
            <button className={url.includes("lrt") ? "close-button left" : "close-button right"} onClick={onClose} />
            <iframe className={url.includes("lrt") ? "lrt-content" : ""} style={visibility} src={url} allowFullScreen />
        </div>
    )
}

export default function App() {
	const [guide, setGuide] = useState({})
	const [items, setItems] = useState(-1)
	const [updated, setUpdated] = useState(false)
	const [synced, setSynced] = useState(false)
	const [selectedUrl, setSelectedUrl] = useState(null)

	const isLoading = items === -1;
	const hasError = items === 0 && synced;
	const isOutdated = items > 0 && items < channels.length && synced;

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

	const fetchGuide = () => {
		console.log("Fetching EPG data...")
		fetch(proxy_url)
		.then(res => res.text())
		.then(text => {
			localStorage.setItem("epg", text)
			setSynced(true)
		})
		.catch(err => {
			console.error("EPG fetch error:", err)
			setItems(0)
		})
	}

	return (
	<>
		<header>TV programa <Label value={channels.length} /></header>
		<Channels epg={guide} onSelect={setSelectedUrl} />
		{selectedUrl && <Preview url={selectedUrl} onClose={() => setSelectedUrl(null)} />}
		{isLoading && <Loader />}
		{hasError && <Toast message="Error fetching EPG data!" button="Retry" action={() => setSynced(false)} />}
		{isOutdated && <Toast message="EPG is outdated!" button="Update" action={() => setSynced(false)} />}
	</>
	)
}
