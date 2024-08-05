import {createRoot} from 'react-dom/client'
import {useState} from 'react'

function App() {
    const [timestamp, setTimestamp] = useState(0)
    return (
        <div>
            {timestamp}
        </div>
    )
}
createRoot(document.getElementById('app')!).render(<App/>)
