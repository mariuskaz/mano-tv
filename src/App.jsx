import './App.css';
import React, { useState, useEffect } from 'react';

export default function App() {
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const response = await fetch('https://api.codetabs.com/v1/proxy?quest=https://www.programatv.lt/');
                const text = await response.text();
                
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                // Extract channel information
                const program = Array.from(doc.querySelectorAll('.channel')).map(channel => {

                    let pos = 0
                    let schedule = Array.from(channel.querySelectorAll('.info, .info-down'))

                    schedule.map( (info, index) => {
                        if (info.classList.contains('info-down')) pos = index
                    })

                    const name = channel.querySelector('a').textContent
                    const logo = channel.querySelector('img').src.replace(location.origin,"https://www.programatv.lt")
                    const now = schedule[pos].querySelector('.info-down strong')?.textContent + " " +
                                schedule[pos].querySelectorAll('.info-down strong')[1]?.textContent
                    const next = (schedule[pos + 1]?.querySelector('strong')?.textContent || "") + " " +
                                (schedule[pos + 1]?.querySelector('span')?.textContent || "")

                    const url = "#"
                    const start = parseDate(schedule[pos].querySelector('.info-down strong')?.textContent.trim())
                    const stop = parseDate(schedule[pos + 1]?.querySelector('strong')?.textContent)

                    const date = new Date()
                    const progress = (date - start) * 100 / (stop - start)

                    return { name, logo, url, progress, now, next }
                });

                // Update state with extracted channels
                setChannels(program);

            } catch (error) {
                console.error('Error fetching TV program:', error);

            }
        };

        fetchProgram();
    }, []);

    function parseDate(d = "00:00") {
        let date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        h = d.substring(0, 2),
        m = d.substring(3, 5)
        return new Date(year, month, day, h, m)
      }

    function Label({ value }) {
        return <span className='float-label'>{value}</span>
    }

    function Channels({ list }) {
        return <div className='channels-list'>{list}</div>
    }

    function Channel({ channel }) {
        return (
          <div className='channel' onClick={() => window.open(channel.url)}>  
            <div className='logo'><img src={channel.logo} alt="logo" />{channel.name}</div>
            <div className='content'>
              <div>{channel.now}</div><progress className='progress' value={channel.progress} max={100} /><div style={{color:'darkgrey'}}>{channel.next}</div>
            </div>
          </div>
        )
      }

    const myChannelsList = channels.map( (channel, index) => {
        return <Channel channel={channel} key={index} />
    })

    return (
        <>
            <header>TV programa <Label value={channels.length}/></header>
            <Channels list={myChannelsList}/>
        </>
    );
}
