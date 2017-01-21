git pull origin master

docker build . -t exam_papers_repository:node

docker stop exam_papers_repository 
docker rm exam_papers_repository 
docker run -p 8080:8080 --name exam_papers_repository exam_papers_repository:node node index.js
