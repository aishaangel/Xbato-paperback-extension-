import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    SearchRequest,
    PagedResults,
    SourceInfo
} from "paperback-extensions-common"

export const XbatoInfo: SourceInfo = {
    version: "1.0.0",
    name: "Xbato",
    author: "YourName",
    authorWebsite: "https://xbato.com",
    description: "Xbato extension for Paperback",
    language: "en",
    contentRating: "EVERYONE"
}

export class Xbato extends Source {

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const response = await this.requestManager.schedule(
            this.requestManager.get(`https://xbato.com/manga/${mangaId}`)
        )
        const $ = this.cheerio.load(response.data)

        const title = $('h1.manga-title').text().trim()
        const image = $('img.cover').attr('src') || ''
        const description = $('div.description').text().trim()
        const author = $('span.author').text().trim()

        return {
            id: mangaId,
            titles: [title],
            image: image,
            author: author,
            description: description,
            rating: 0,
            status: 1
        }
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const response = await this.requestManager.schedule(
            this.requestManager.get(`https://xbato.com/manga/${mangaId}`)
        )
        const $ = this.cheerio.load(response.data)

        const chapters: Chapter[] = []

        $('ul.chapter-list li a').each((i, el) => {
            const chapterId = $(el).attr('href')?.split('/').pop() || ''
            const title = $(el).text().trim()
            chapters.push({
                id: chapterId,
                mangaId: mangaId,
                title: title,
                chapter: 0,
                volume: 0,
                date: 0
            })
        })

        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const response = await this.requestManager.schedule(
            this.requestManager.get(`https://xbato.com/manga/${mangaId}/chapter/${chapterId}`)
        )
        const $ = this.cheerio.load(response.data)

        const pages: string[] = []
        $('div.page img').each((i, el) => {
            const img = $(el).attr('src')
            if (img) pages.push(img)
        })

        return {
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        }
    }

    async searchRequest(query: SearchRequest): Promise<PagedResults> {
        const response = await this.requestManager.schedule(
            this.requestManager.get(`https://xbato.com/search?query=${encodeURIComponent(query.title ?? '')}`)
        )
        const $ = this.cheerio.load(response.data)

        const results: Manga[] = []
        $('div.search-result a').each((i, el) => {
            const id = $(el).attr('href')?.split('/').pop() || ''
            const title = $(el).text().trim()
            const image = $(el).find('img').attr('src') || ''
            results.push({
                id: id,
                titles: [title],
                image: image
            })
        })

        return {
            results: results,
            hasMore: false
        }
    }
}
