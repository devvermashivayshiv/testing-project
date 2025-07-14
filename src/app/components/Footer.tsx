import "../../cssdesign/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      &copy; {new Date().getFullYear()} AdSense Automation. All rights reserved.
    </footer>
  );
} 