import express from 'express';
import cors from 'cors';
import {
    ytShorts,
    spotifyDownload,
    rednote,
    pddiktiSearch,
    mahasiswaDetail,
    pinterest,
    shutterstock,
    memberJkt,
    detailMember,
    getMp3Murotal,
    surahNames,
    tiktokDl,
    igDl
} from './src/index.js';
import { ytMp3 } from './src/ytmp3.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation HTML
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Documentation</title>
            <style>
                body { 
                    font-family: sans-serif;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .endpoint {
                    border: 1px solid #ddd;
                    margin: 10px 0;
                    padding: 15px;
                    border-radius: 5px;
                }
                .method {
                    font-weight: bold;
                    color: #009900;
                }
                .path {
                    font-family: monospace;
                    font-size: 1.1em;
                }
                .params {
                    margin-left: 20px;
                }
            </style>
        </head>
        <body>
            <h1>API Scraper Documentation</h1>
            <p>Dokumentasi API untuk berbagai layanan scraping</p>

            <h2>Youtube Shorts</h2>
            <div class="endpoint">
                <span class="method">GET</span> 
                <span class="path">/api/ytshorts?url={url}</span>
                <p>Mengambil data dari Youtube Shorts</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Youtube Shorts</li>
                    </ul>
                </div>
            </div>

            <h2>Spotify</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/spotify?url={url}</span>
                <p>Mengambil data dari Spotify</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Spotify</li>
                    </ul>
                </div>
            </div>

            <h2>RedNote</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/rednote?url={url}</span>
                <p>Mengambil data dari RedNote</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL RedNote</li>
                    </ul>
                </div>
            </div>

            <h2>Pinterest</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/pinterest?url={url}</span>
                <p>Mengambil data dari Pinterest</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Pinterest</li>
                    </ul>
                </div>
            </div>

            <h2>Shutterstock</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/shutterstock?url={url}</span>
                <p>Mengambil data dari Shutterstock</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Shutterstock</li>
                    </ul>
                </div>
            </div>

            <h2>PDDIKTI</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/pddikti/search?q={query}</span>
                <p>Mencari data mahasiswa di PDDIKTI</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>q (required) - Kata kunci pencarian</li>
                    </ul>
                </div>
            </div>

            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/pddikti/detail?link={link}</span>
                <p>Mengambil detail mahasiswa dari PDDIKTI</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>link (required) - Link detail mahasiswa</li>
                    </ul>
                </div>
            </div>

            <h2>JKT48</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/jkt48/members</span>
                <p>Mengambil daftar member JKT48</p>
            </div>

            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/jkt48/member/{id}</span>
                <p>Mengambil detail member JKT48</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>id (required) - ID member JKT48</li>
                    </ul>
                </div>
            </div>

            <h2>Murotal MP3</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/getMp3Murotal</span>
                <p>Mengambil daftar murotal MP3</p>
            </div>

            <h2>Surah Names</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/surahNames</span>
                <p>Mengambil daftar nama surah</p>
            </div>

            <h2>Tiktok Downloader</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/tiktok?url={url}</span>
                <p>Mengambil data dari Tiktok</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Tiktok</li>
                    </ul>
                </div>
            </div>

            <h2>Instagram Downloader</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/ig?url={url}</span>
                <p>Download Video dan Gambar dari Instagram</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Instagram</li>
                    </ul>
                </div>
            </div>

            <h2>Youtube MP3</h2>
            <div class="endpoint">
                <span class="method">GET</span>
                <span class="path">/api/ytmp3?url={url}</span>
                <p>Download MP3 from Youtube</p>
                <div class="params">
                    <p><b>Parameter:</b></p>
                    <ul>
                        <li>url (required) - URL Youtube</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Route handlers
const handleError = (res, error) => {
    console.error('Error:', error);
    res.status(500).json({
        status: false,
        message: error.message || 'Internal server error'
    });
};

// Youtube Shorts endpoint
app.get('/api/ytshorts', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await ytShorts(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});
app.get('/api/tiktok', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await tiktokDl(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});
app.get('/api/ig', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await igDl(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Spotify endpoint
app.get('/api/spotify', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await spotifyDownload(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// RedNote endpoint
app.get('/api/rednote', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await rednote(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Pinterest endpoint
app.get('/api/pinterest', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await pinterest(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Shutterstock endpoint
app.get('/api/shutterstock', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter diperlukan'
            });
        }

        const result = await shutterstock(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// PDDIKTI search endpoint
app.get('/api/pddikti/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                status: false,
                message: 'Query parameter diperlukan'
            });
        }

        const result = await pddiktiSearch(q);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// PDDIKTI detail endpoint
app.get('/api/pddikti/detail', async (req, res) => {
    try {
        const { link } = req.query;
        if (!link) {
            return res.status(400).json({
                status: false,
                message: 'Link parameter diperlukan'
            });
        }

        const result = await mahasiswaDetail(link);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// JKT48 members endpoint
app.get('/api/jkt48/members', async (req, res) => {
    try {
        const result = await memberJkt();
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// JKT48 member detail endpoint
app.get('/api/jkt48/member/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: 'ID parameter diperlukan'
            });
        }

        const result = await detailMember(id);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Murotal MP3 endpoint
app.get('/api/getMp3Murotal', async (req, res) => {
    try {
        const result = await getMp3Murotal();
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Surah Names endpoint
app.get('/api/surahNames', async (req, res) => {
    try {
        const result = surahNames;
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Youtube MP3 endpoint
app.get('/api/ytmp3', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({
                status: false,
                message: 'URL parameter is required'
            });
        }

        const result = await ytMp3(url);
        res.json({
            status: true,
            result
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Handle 404 Not Found
app.use((req, res) => {
    res.status(404).json({
        status: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
