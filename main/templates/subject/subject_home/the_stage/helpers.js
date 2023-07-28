/**
 * check for rectangle intersection
 */
check_for_rect_intersection(rect1, rect2)
{
   if(rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y)
   {
        return true;
   }

   return false;

},

/**
 * check for circle and rectangle intersection
 */
check_for_circle_rect_intersection(circle, rect)
{
    if(app.check_point_in_rectagle({x:circle.x, y:circle.y}, rect)) return true;

    let pt1 = {x:rect.x, y:rect.y};
    let pt2 = {x:rect.x+rect.width, y:rect.y};
    let pt3 = {x:rect.x, y:rect.y+rect.height};
    let pt4 = {x:rect.x+rect.width, y:rect.y+rect.height};

    if(app.check_line_circle_intersection({start:pt1, end:pt2}, circle)) return true;
    if(app.check_line_circle_intersection({start:pt1, end:pt3}, circle)) return true;
    if(app.check_line_circle_intersection({start:pt2, end:pt4}, circle)) return true;
    if(app.check_line_circle_intersection({start:pt3, end:pt4}, circle)) return true;

    return false;

},

/**
 * check if point is in rectangle
 */
check_point_in_rectagle(point, rect)
{
    if(point.x >= rect.x && point.x <= rect.x + rect.width &&
         point.y >= rect.y && point.y <= rect.y + rect.height)
    {
        return true;
    }

    return false;
},

/**
 * check if line intersects circle
 */
check_line_circle_intersection(line, circle)
{
    // Get the distance between the line's end points and the circle's center.
    const distance1 = app.get_distance(line.start, {x:circle.x, y:circle.y});
    const distance2 = app.get_distance(line.end, {x:circle.x, y:circle.y});

    // Get the length of the line.
    const lineLength = app.get_distance(line.start, line.end);

    // Get the dot product of the line and circle.
    const dotProduct = ((circle.x - line.start.x) * (line.end.x - line.start.x)) + ((circle.y - line.start.y) * (line.end.y - line.start.y));

    // Get the closest point on the line to the circle.
    const closestPoint = {
        x: line.start.x + (((line.end.x - line.start.x) * dotProduct) / Math.pow(lineLength, 2)),
        y: line.start.y + (((line.end.y - line.start.y) * dotProduct) / Math.pow(lineLength, 2))
    };

    // Check if the closest point is on the line.
    const onLine = app.check_point_in_rectagle(closestPoint, {x:line.start.x, y:line.start.y, width:line.end.x-line.start.x, height:line.end.y-line.start.y});

    // If the closest point is not on the line, return false.
    if (!onLine) {
        return false;
    }

    // Get the distance between the closest point and the circle's center.
    const distanceToClosest = app.get_distance(closestPoint, circle);

    // If the distance to the closest point is less than the circle's radius, return true.
    if (distanceToClosest <= circle.radius) {
        return true;
    }

    // Return false.
    return false;
},

/**
 * get distance in pixels between two points
 */
get_distance(point1, point2) 
{
    // Get the difference between the x-coordinates of the two points.
    const dx = point2.x - point1.x;
  
    // Get the difference between the y-coordinates of the two points.
    const dy = point2.y - point1.y;
  
    // Calculate the square of the distance between the two points.
    const distanceSquared = dx * dx + dy * dy;
  
    // Take the square root of the distance between the two points.
    const distance = Math.sqrt(distanceSquared);
  
    // Return the distance between the two points.
    return distance;
},
