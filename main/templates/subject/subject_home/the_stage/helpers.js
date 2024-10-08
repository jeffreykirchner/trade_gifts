/**
 * check for rectangle intersection
 */
check_for_rect_intersection: function check_for_rect_intersection(rect1, rect2)
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
check_for_circle_rect_intersection: function check_for_circle_rect_intersection(circle, rect)
{
    if(app.check_point_in_rectagle({x:circle.x, y:circle.y}, rect)) return true;

    let pt1 = {x:rect.x, y:rect.y};
    let pt2 = {x:rect.x+rect.width, y:rect.y};
    let pt3 = {x:rect.x, y:rect.y+rect.height};
    let pt4 = {x:rect.x+rect.width, y:rect.y+rect.height};

    if(app.check_line_circle_intersection({p1:pt1, p2:pt2}, circle)) return true;
    if(app.check_line_circle_intersection({p1:pt1, p2:pt3}, circle)) return true;
    if(app.check_line_circle_intersection({p1:pt2, p2:pt4}, circle)) return true;
    if(app.check_line_circle_intersection({p1:pt3, p2:pt4}, circle)) return true;

    return false;
},

/**
 * check if point is in rectangle
 */
check_point_in_rectagle: function check_point_in_rectagle(point, rect)
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
check_line_circle_intersection: function check_line_circle_intersection(line, circle)
{
    let a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;

    v1 = {};
    v2 = {};
    v1.x = line.p2.x - line.p1.x;
    v1.y = line.p2.y - line.p1.y;
    v2.x = line.p1.x - circle.x;
    v2.y = line.p1.y - circle.y;
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if(isNaN(d)){ // no intercept
        return false;
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;    
    retP1 = {};   // return points
    retP2 = {}  
    ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
        retP1.x = line.p1.x + v1.x * u1;
        retP1.y = line.p1.y + v1.y * u1;
        ret[0] = retP1;
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
        retP2.x = line.p1.x + v1.x * u2;
        retP2.y = line.p1.y + v1.y * u2;
        ret[ret.length] = retP2;
    }

    if(ret.length > 0) return true;

    return false;
},

/**
 * get distance in pixels between two points
 */
get_distance: function get_distance(point1, point2) 
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

/**
 * degrees to radians
 */
degrees_to_radians: function degrees_to_radians(degrees)
{
    let pi = Math.PI;
    return degrees * (pi/180);
},

/**
 * find point on circle
 */
find_point_on_circle: function find_point_on_circle(center, radius, angle)
{
    let point = {};
    point.x = center.x + radius * Math.cos(angle);
    point.y = center.y + radius * Math.sin(angle);
    return point;
},

/**
 * check if circles intersect
 */
check_circle_intersection: function check_circle_intersection(circle1, circle2)
{
    let distance = app.get_distance(circle1.center, circle2.center);
    if(distance <= circle1.radius + circle2.radius) return true;
    return false;
},

/**
 * check if point is in circle
 */
check_point_in_circle: function check_point_in_circle(point, circle)
{
    let distance = app.get_distance(point, circle.center);
    if(distance <= circle.radius) return true;
    
    return false;
},

/**
 * find point given angle and distance
 **/
get_point_from_angle_distance: function get_point_from_angle_distance(start_x, start_y, width, height, distance)
{
    let angle = app.get_angle(start_x, start_y, width, height);
    return {x:start_x + distance * Math.cos(angle), 
            y:start_y + distance * Math.sin(angle)};
},

/**
 * find the angle between two points
 */
get_angle: function get_angle(x1, y1, x2, y2)
{
    return Math.atan2(y2 - y1, x2 - x1);
},

/**
 * return html colorized text based on group naes
 */
colorize_text: function colorize_text(text)
{
    let new_text = text;

    //replace group names with colored text
    for(let i in app.session.parameter_set.parameter_set_groups)
    {
        let parameter_set_group = app.session.parameter_set.parameter_set_groups[i];
        new_text = new_text.replace(parameter_set_group.name, "<span style='color:"+parameter_set_group.name+"'>"+parameter_set_group.name+"</span>");
    }

    //replace player names with colored text
    for(let i in app.session.parameter_set.parameter_set_players)
    {
        let parameter_set_player = app.session.parameter_set.parameter_set_players[i];
        let parameter_set_group = app.session.parameter_set.parameter_set_groups[parameter_set_player.parameter_set_group];
        new_text = new_text.replace(parameter_set_player.id_label, "<span style='color:"+parameter_set_group.name+"'>"+parameter_set_player.id_label+"</span>");
    }

    return new_text;
},