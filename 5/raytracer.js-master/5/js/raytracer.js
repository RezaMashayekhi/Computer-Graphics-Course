
let canvas;
let context;
let renderButton;

window.onload = function() {
    renderButton = document.getElementById( "#render_button" );
    canvas = document.getElementById( "#canvas" );
    context = canvas.getContext("2d");
};

function render() {
    const width = canvas.width;
    const height = canvas.height;
    let imageData = context.getImageData(0, 0, width, height);

    let world = new HitableList();

    let checker = new Checker_Texture(new Solid_Color(0.8, 0.84375, 0.8984375), new Solid_Color(0, 0.4, 0.9));
    world.list.push(new Sphere(new Vector(0, -500, -1), 500, new LambertianMaterial(checker)));
    world.list.push(new Sphere(new Vector(-1, 1, 1), 1, new LambertianMaterial(new Solid_Color(0.7, 1, 0))));
    world.list.push(new Disk(new Vector(-0.5, 2, -3), 2, new Vector(-1, -1, 4), new MetalMaterial(new Vector(1 , 1 , 1 ), 0.015)));
    world.list.push(new Cylinder(new Vector(-5, 1.2, 0), new Vector(-3.5, 1.2, -4), 1.2, new MetalMaterial(new Vector(0.6 , 0.6 , 1 ), 0.015)));
    world.list.push(new Triangle(new Vector(1, 0, 1), new Vector(2, 0, 2), new Vector(1.5, 3, 1.5), new LambertianMaterial(new Solid_Color(0.6 , 0.6 , 1))));

    let lookFrom = new Vector(-3, 3.5, 10);
    let lookAt = new Vector(-1, 1, 0);
    let distToFocus = lookFrom.subtract(lookAt).length();
    let cam = new Camera(lookFrom, lookAt, new Vector(0, 1, 0), 35, width / height, 0.1, distToFocus);

    let ns = 100;

    for (let y = 0; y < height; y++) {

        console.log("Rendering line " + y);

        for (let x = 0; x < width; x++) {

            let color = new Vector(0, 0, 0);
            for (let s = 0; s < ns; s++) {
                let u = (x + Math.random()) / width;
                let v = (y + Math.random()) / height;
                let r = cam.getRay(u, v);
                let p = r.pointAtParameter(2.0);
                color = color.add(getColor(r, world, 0));
            }
            color = color.divide(ns);

            color.x = Math.sqrt(color.x);
            color.y = Math.sqrt(color.y);
            color.z = Math.sqrt(color.z);

            setPixel(imageData.data, width, x, height - y, 255 * color.x, 255 * color.y, 255 * color.z);
        }
    }

    context.putImageData(imageData, 0, 0);
}


function getColor(ray, world, depth) {
    let rec = new HitRecord();
    if (world.hit(ray, 0.001, Number.MAX_VALUE, rec)) {
        let scattered = new Ray(new Vector(), new Vector());
        let attenuation = new Vector();

        if (depth < 50 && rec.material.scatter(ray, rec, attenuation, scattered)) {
            return attenuation.multiply(getColor(scattered, world, depth + 1));
        } else {
            return new Vector(0, 0, 0);
        }

    } else {
        let unitDirection = ray.direction().unit();
        t = 0.5 * (unitDirection.y + 1.0);
        return (new Vector(1.0, 1.0, 1.0)).multiply(1.0 - t).add( (new Vector(0.5, 0.7, 1.0)).multiply(t) );
    }
}

function setPixel(data, width, x, y, r, g, b) {
    const p = (y * width + x) * 4;
    data[p] = r;
    data[p + 1] = g;
    data[p + 2] = b;
    data[p + 3] = 255;
}
