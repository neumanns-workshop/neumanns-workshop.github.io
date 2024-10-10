async function fetchBlogPosts() {
    const response = await fetch('https://api.github.com/repos/neumanns-workshop/neumanns-workshop.github.io/contents/blog');
    const files = await response.json();
    
    const blogPosts = await Promise.all(files
        .filter(file => file.name.endsWith('.md'))
        .map(async file => {
            const content = await fetch(file.download_url).then(res => res.text());
            const [, date, ...titleParts] = file.name.slice(0, -3).split('-');
            const title = titleParts.join(' ');
            return { date, title, content };
        }));

    return blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderBlogPosts(posts) {
    const container = document.getElementById('blog-posts');
    container.innerHTML = ''; // Clear any existing content
    posts.forEach(post => {
        const article = document.createElement('div');
        article.className = 'card';
        article.innerHTML = `
            <div class="page-header">
                <h2>${post.title}</h2>
            </div>
            <section class="blog-post">
                <p class="date">Published on: ${new Date(post.date).toLocaleDateString()}</p>
                <div class="blog-content">
                    ${marked.parse(post.content)}
                </div>
            </section>
        `;
        container.appendChild(article);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.endsWith('blog.html')) {
        try {
            const posts = await fetchBlogPosts();
            renderBlogPosts(posts);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            document.getElementById('blog-posts').innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
        }
    }
});