import './App.css';
import React, { useState, useEffect, useLayoutEffect } from 'react';

export default function App() {
    const [guide, setGuide] = useState({})
    const [updated, setUpdated] = useState(false)
    const [synced, setSynced] = useState(false)
    const [items, setItems] = useState(-1)
  
    const epg_link = 'https://www.bevy.be/bevyfiles/lithuania3.xml'
  
    const channels = [
      { 
        id: "LRT Televizija.lt",
        url: "https://www.lrt.lt/mediateka/tiesiogiai/lrt-televizija",
        logo: "https://www.lrt.lt/images/logo/logo-lrt.svg?v=673",
        name: "LRT",
      },
      { 
        id: "LNK.lt",
        url: "https://lnk.lt/video-embed/ad1a0439-7a2c-47d8-80c8-cf9b6b6a2f76/lnk-hd-kanalas-internetu?muteOnStart=true&autoStart=true&startFrom=undefined", //"https://lnk.lt/tiesiogiai",
        logo: "https://content.tvprograma.lt/logo/220x80_0_88847800_1536058587m.png",
        name: "LNK",
      }, 
      { 
        id: "TV3.lt",
        url: "https://play.tv3.lt/lives",
        logo: "https://www.programatv.lt/images/channels/03.png?v=1",
        name: "TV3",
      },
      { 
        id: "BTV.lt",
        url: "https://lnk.lt/tiesiogiai#btv",
        logo: "https://content.tvprograma.lt/logo/220x80_0_99643600_1536832966m.png",
        name: "BTV",
      },
      { 
        id: "TV1.lt",
        url: "https://lnk.lt/tiesiogiai#tv1",
        logo: "https://content.tvprograma.lt/logo/220x80_0_50644700_1415689122m.png",
        name: "TV1",
      },
      { 
        id: "2TV.lt",
        url: "https://lnk.lt/tiesiogiai#2tv",
        logo: "https://content.tvprograma.lt/logo/220x80_0_88998600_1585550605m.png",
        name: "2TV",
      },
      { 
        id: "TV6.lt",
        url: "https://play.tv3.lt/live/tv6-lt,live-2838694",
        logo: "https://content.tvprograma.lt/logo/220x80_0_98820800_1665328884m.jpg",
        name: "TV6",
      },
      { 
        id: "Lietuvos ryto TV.lt",
        url: "https://tv.lrytas.lt/live",
        logo: "https://content.tvprograma.lt/logo/220x80_0_80098400_1538461908m.png",
        name: "Lietuvos rytas",
      },
      { 
        id: "LRT Plius.lt",
        url: "https://www.lrt.lt/mediateka/tiesiogiai/lrt-plius",
        logo: "https://content.tvprograma.lt/logo/220x80_0_91824600_1652106605m.jpg",
        name: "LRT PLIUS",
      },
      { 
        id: "Info TV.lt",
        url: "https://lnk.lt/tiesiogiai#infotv",
        logo: "https://content.tvprograma.lt/logo/220x80_0_34085600_1418495360m.png",
        name: "Info TV",
      },
      { 
        id: "Delfi TV.lt",
        url: "https://www.delfi.lt/video/puslapis/tv",
        logo: "https://content.tvprograma.lt/logo/220x80_0_11928400_1633001331m.png",
        name: "Delfi",
      },  
      { 
        id: "TV3 Plus.lt",
        url: "https://play.tv3.lt/show/tv3-plus,live-4929289",
        logo: "https://content.tvprograma.lt/logo/220x80_0_37190500_1654152447m.png",
        name: "TV3 PLUS",
      },
    ]
  
    useEffect(() => {
      if (updated) return

      const epg_text = localStorage['epg']

      if (epg_text === undefined) {
        fetchGuide()

      } else {
        const parser = new DOMParser()
        const xml = parser.parseFromString(epg_text, "application/xml")
        const programs = xml.getElementsByTagName("programme")
        const now = new Date()

        let epg = {}
        let count = 0

        setItems(-1)

        for (let item = 0; item < programs.length; item++) {
          let channel = programs[item].getAttribute('channel') || ""
          let title = programs[item].getElementsByTagName("title")[0]?.childNodes[0].nodeValue || ""
  
          let start = parseDate(programs[item].getAttribute('start'))
          start.setTime(start.getTime() + 2 * 60 * 60 * 1000)
  
          let stop = parseDate(programs[item].getAttribute('stop'))
          stop.setTime(stop.getTime() + 2 * 60 * 60 * 1000)
  
          if (epg[channel] === undefined) 
            epg[channel] = { now: "", stop: "", next: "", progress: 0 }
  
          if (start <= now && stop >= now) {
            epg[channel].now = start.toLocaleTimeString().substring(0, 5) + " " + title
            epg[channel].progress = (now - start) * 100 / (stop - start)
            epg[channel].stop = stop
            count ++
  
          } else if (start <= epg[channel].stop) 
            epg[channel].next = start.toLocaleTimeString().substring(0, 5) + " " + title
  
        }

        if (count === 0 && !synced) {
          fetchGuide()

        } else {
          setGuide(epg)
          setItems(count)
          
        }
  
      }
  
      setUpdated(true)
  
    }, [updated])
  
    useLayoutEffect(() => {
      document.addEventListener("visibilitychange", onVisibilityChange)
      return () => document.removeEventListener("visibilitychange", onVisibilityChange)
    })
  
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') setSynced(false)
    }
  
    function parseDate(d) {
      const year = d.substring(0, 4),
      month = d.substring(4, 6),
      day = d.substring(6, 8),
      h = d.substring(8, 10),
      m = d.substring(10, 12)
      return new Date(year, month - 1, day, h, m)
    }
  
    function fetchGuide() {
      fetch('https://api.codetabs.com/v1/proxy?quest=' + epg_link)
      .then(res => {
        setSynced(true)
        return res.text()
      })

      .then(text => { 
        localStorage.setItem("epg", text)
        setUpdated(false)
      })

      .catch(err => {
        console.error(err.message)
      })
    }
  
    const Label = ({ value }) => {
      return <span className='float-label'>{value}</span>
    }
  
    const Toast = ({ message, button, action }) => {
        return <div className='toast'>{message}<span className='toast-button' onClick={action}>{button}</span></div>
    }
  
    const Channel = ({ channel }) => {
      return (
        <div className='channel' onClick={() => window.open(channel.url)}>  
          <div className='logo'><img src={channel.logo} alt="logo" />{channel.name}</div>
          <div className='content'>
            <div>{guide[channel.id]?.now}</div><progress className='progress' value={guide[channel.id]?.progress} max={100} /><div style={{color:'darkgrey'}}>{guide[channel.id]?.next}</div>
          </div>
        </div>
      )
    }
  
    const Channels = ({ list }) => {
      return <div className='channels-list'>{list}</div>
    }
  
    const myChannelsList = channels.map( channel => {
      return <Channel channel={channel} key={channel.id} />
    })
  
    return (
      <>
        <header>TV programa <Label value={channels.length} /></header>
        <Channels list={myChannelsList} />
        {items == 0 && <Toast message={"Error fetching EPG data!"} button={"Retry"} action={fetchGuide} />}
      </>
    )
}
