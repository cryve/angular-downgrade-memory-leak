# Angular downgrade memory leak demo

## Create memory leak
1. Run `npm install` for the AngularJS here in the project root folder.
2. Run `npm install` in the ngx folder.
3. Run `npm start` in the ngx folder.
4. Open the app in the browser and take a Heap Snapshot (DevTools > Memory). There should be no `ContentComponent` inside the heap.
5. Click the toggle button 5 times and take a Heap Snapshot. There are 5 instances of `ContentComponent` in the heap, but should be 1 maximum.
