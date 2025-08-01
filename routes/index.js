import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  handleSubmit,
  renderHome,
  renderRecentSearches,
  renderAbout,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", asyncHandler(renderHome));
router.get("/recent", asyncHandler(renderRecentSearches));
router.get("/submit", (req, res) => res.redirect("/"));
router.post("/submit", asyncHandler(handleSubmit));
router.get("/about", asyncHandler(renderAbout));

// 404 fallback
router.use((req, res) => {
  res.status(404).render("404", { errorMessage: "Page not found" });
});

export default router;
