import './style.css'

document.querySelector('#app').innerHTML = `
    <main class="container">
    <div id="app"></div>

<div class="background-arrows">
    <span>&gt;</span>
    <span>&gt;</span>
    <span>&gt;</span>
</div>
        <h1>URL Shortener</h1>

        <form id="shorten-form">
            <input
                type="url"
                id="url-input"
                placeholder="Enter URL"
                required
            >

            <button type="submit">
                Shorten URL
            </button>
        </form>

        <div id="result"></div>

    </main>
`

const form = document.querySelector('#shorten-form')
const urlInput = document.querySelector('#url-input')
const result = document.querySelector('#result')

form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const url = urlInput.value

    const response = await fetch('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url
        })
    })

    const data = await response.json()

    if (!response.ok) {
        result.textContent = data.error
        return
    }

    result.innerHTML = `
        <p>Your shortened URL:</p>
        <a href="${data.shortUrl}" target="_blank">
            ${data.shortUrl}
        </a>
    `
})