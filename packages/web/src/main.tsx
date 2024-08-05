import {createRoot} from 'react-dom/client'
import {InterClient} from 'ipc'
import {useState} from 'react'

declare global {
    interface Window {
        ipc: InterClient
    }
}

function App() {
    const [timestamp, setTimestamp] = useState(0)
    setTimeout(async () => {
        setTimestamp(await window.ipc.invoke({ctrl: 'example', act: 'test'}))
    }, 1000)
    return (
        <div>
            {timestamp}
        </div>
    )
}

console.log(window.ipc)
createRoot(document.getElementById('app')!).render(<App/>)
