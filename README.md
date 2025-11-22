# notion alike
- the app will be offline at first (user cannot share folders/files within the site, unless he downloads it)
## WEB -> offline
### USER
1. user authentication ->                         done
2. user can create note files ->                  done
2. user can create task files ->                  done
3. user can create folders ->                     todo
4. user can save notes after modifing them ->     semi-done
5. user can make his notes public ->              todo


todo: 
  in profile tab:
    have a section that includes the latest created/updated notes/tasks
    have a favorite tasks tab
    - add favorite -> a table in db (id, user_id, favorite_type, item_id, name, description, created_at)
    - last created -> a select query with order by -> select * from tasks order by created_at desc limit 10

todo: 
  improve folders functionality -> add item to folder
  