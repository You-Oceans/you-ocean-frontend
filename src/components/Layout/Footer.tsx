import { FaTwitter, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="text-white py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-[#004b53] via-[#006e74] to-[#007a82] relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between lg:px-[4rem] gap-8">
          <div className="mb-8 lg:mb-0">
            <h3 className="text-2xl font-bold mb-4">YouOceans</h3>
            <p className="max-w-md">
              Empowering Oceans with AI-driven tools and insights.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#00b0b9] transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="hover:text-[#00b0b9] transition-colors">
                <FaFacebookF size={24} />
              </a>
              <a href="#" className="hover:text-[#00b0b9] transition-colors">
                <FaLinkedinIn size={24} />
              </a>
            </div>
            <div className="mt-4 flex items-center">
              <MdMailOutline size={20} className="mr-2" />
              <a
                href="mailto:info@you-oceans.com"
                className="hover:text-[#ff6f61] transition-colors"
              >
                info@you-oceans.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-8 border-t border-[#003e45] text-center">
          <p>&copy; 2024 youoceans. All rights reserved.</p>
        </div>
      </div>

      <div className="absolute left-0 bottom-0 z-10">
        <img
          src="/Vector (1).svg"
          alt="SVG Image"
          className="w-[150px] sm:w-[200px] lg:w-[300px] h-auto opacity-50"
        />
      </div>
    </footer>
  );
}
