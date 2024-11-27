import './App.css';
import React, { useState, useEffect } from 'react';

export default function App() {
  const [tvChannels, setTvChannels] = useState([]);

    useEffect(() => {
        const fetchTvProgram = async () => {
            try {
                const response = await fetch('https://api.codetabs.com/v1/proxy?quest=https://www.programatv.lt/');
                const text = await response.text();
                
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                // Extract channel information
                const channels = Array.from(doc.querySelectorAll('.channel')).map(channel => {

                    let pos = 0
                    let schedule = Array.from(channel.querySelectorAll('.info, .info-down'))

                    schedule.map( (info, index) => {
                        if (info.classList.contains('info-down')) pos = index
                    })

                    return {
                        name: channel.querySelector('a').textContent || "unknown",
                        logo: channel.querySelector('img').src.replace(location.origin,"https://www.programatv.lt"),
                        time: schedule[pos].querySelector('.info-down strong')?.textContent,
                        title: schedule[pos].querySelectorAll('.info-down strong')[1]?.textContent,
                        nextTime: schedule[pos+1]?.querySelector('strong')?.textContent || "",
                        nextTitle: schedule[pos+1]?.querySelector('span')?.textContent || "",
                    };
                });

                

                // Update state with extracted channels
                setTvChannels(channels);

            } catch (error) {
                console.error('Error fetching TV program:', error);

            }
        };

        fetchTvProgram();
    }, []);

    return (
        <div>
            <h1>Test</h1>
            <div>
                {tvChannels.map((channel, index) => (
                    <div key={index}>
                        <img src={channel.logo} alt={channel.name} />
                        <b>{channel.name}</b>
                        <p>{channel.time} {channel.title}</p>
                        <p>{channel.nextTime} {channel.nextTitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
