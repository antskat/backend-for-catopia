import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Can't create post",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const currentUser = await UserModel.findById(req.userId);

    if (!(post.user.toString() === req.userId || currentUser.isAdmin)) {
      return res.status(403).json({
        message: "Unauthorized: You are not the owner or an admin of this post",
      });
    }

    // Удаляем пост из базы данных
    await PostModel.findByIdAndDelete(postId);

    return res.json({
      message: "Post deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Can't delete post",
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find().select("-user").exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Can't get posts",
    });
  }
};
