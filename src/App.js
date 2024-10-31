import { useEffect, useRef } from 'react';
import { Avatar, List } from 'antd';
import { observer } from 'mobx-react-lite';
import { makeAutoObservable } from 'mobx';

class RepositoryStore {
  repositories = [];
  page = 1;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchRepositories() {
    if (this.loading) return;
    this.loading = true;
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=javascript&sort=stars&order=desc&page=${this.page}&per_page=20`, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'request'
          }
        }
      );
      const data = await response.json();
      this.repositories = [...this.repositories, ...data.items];
      this.page++;
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
    } finally {
      this.loading = false;
    }
  }
}

const repoStore = new RepositoryStore();

const App = observer(() => {
  const loader = useRef(null);

  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting && !repoStore.loading) {
      repoStore.fetchRepositories();
    }
  };

  useEffect(() => {
    repoStore.fetchRepositories();
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="list">
      <h1>Popular JavaScript Repositories</h1>
      <List
        itemLayout="vertical"
        size="large"
        bordered
        loading={repoStore.loading}
        dataSource={repoStore.repositories}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <span key="stars">⭐ {item.stargazers_count}</span>,
              <span key="language">{item.language || 'N/A'}</span>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.owner.avatar_url} />}
              title={<a href={item.html_url} target="_blank" rel="noopener noreferrer">{item.name}</a>}
              description={item.description}
            />
          </List.Item>
        )}
      />
      <div ref={loader} className="loader">
        {/* {repoStore.loading && <Spin tip="Loading more repositories..." />} */}
      </div>
    </div>
  );
});

export default App;
