import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">OneClickSMIS</Link>
          <Link className="btn btn-primary" to="/">Back to Home</Link>
        </div>
      </nav>

      <div className="container my-5">
        <h1 className="text-center mb-5">OneClickSMIS Blog</h1>
        <div className="row">
          {posts.map(post => (
            <div key={post.id} className="col-md-6 mb-4">
              <div className="card">
                <img src={post.image} className="card-img-top" alt={post.title} />
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="btn btn-primary">Read More</Link>
                </div>
                <div className="card-footer text-muted">
                  Published on {new Date(post.publishedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;