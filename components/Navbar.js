import React from "react";

const Navbar = () => {
  return (
    <div className="bg-green-300">
      <div class=" flex flex-wrap p-5 flex-col md:flex-row items-center">
        <span class="ml-3 text-2xl font-bold">Todo App</span>
        <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <a class="mx-5 hover:font-bold">Home</a>
          <a class="mx-5 hover:font-bold">About</a>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
