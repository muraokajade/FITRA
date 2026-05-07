"use client"

import { useState } from "react"

type Article = {
    id: number
    title:string
}

export default function Page() {
    const [articles, setArticles] = useState<Article[]>([
        {id: 1, title:"A"},
        { id: 2, title: "B"}
    ]);

    const addArticle = () => {
        const newId = articles.length + 1
        setArticles([...articles, { id: newId, title: `Article ${newId}`}])
    }


    return (
        <div>
            <button onClick={addArticle}>
                追加
            </button>
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article}/>
            ))}
        </div>
    )
}

function ArticleCard({ article }: { article: Article}) {
    return<div>{ article.title }</div>
}