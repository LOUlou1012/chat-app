"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* =========================
   BUILD TREE FUNCTION
========================= */
function buildTree(comments: any[]) {
  const map: any = {};
  const roots: any[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  comments.forEach((c) => {
    if (c.parent_id) {
      map[c.parent_id]?.children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

/* =========================
   COMMENT COMPONENT
========================= */
function CommentItem({ comment, user, refresh, role }: any) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const handleReply = async () => {
    if (!replyText) return;

    await supabase.from("comments").insert({
      post_id: comment.post_id,
      user_id: user.id,
      content: replyText,
      parent_id: comment.id,
    });

    
    setReplyText("");
    setShowReply(false);
    refresh();
  };

  const handleDelete = async () => {
    await supabase.from("comments").delete().eq("id", comment.id);
    refresh();
  };

  const handleEdit = async () => {
    await supabase
      .from("comments")
      .update({ content: editText })
      .eq("id", comment.id);

    setIsEditing(false);
    refresh();
  };

  return (
    <div className="pl-4 border-l-2 border-white/10">
      <div className="bg-white/5 p-4 rounded-2xl">
        <div className="flex items-start gap-3">
          <img
            src={comment.profiles?.profile_pic || "/defaultpp.png"}
            alt={comment.profiles?.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-emerald-300 text-sm font-semibold">
              {comment.profiles?.username}
            </p>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  className="w-full bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button
                  onClick={handleEdit}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-md text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="mt-1 text-white/90">{comment.content}</p>
            )}

            <div className="flex gap-4 mt-2 text-xs text-emerald-400/80">
              <button
                onClick={() => setShowReply(!showReply)}
                className="hover:text-emerald-300"
              >
                Reply
              </button>

              {(comment.user_id === user?.id || role === "admin")&& (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-yellow-400/80 hover:text-yellow-300"
                  >
                    Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    className="text-red-400/80 hover:text-red-300"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {showReply && (
              <div className="mt-3 space-y-2">
                <textarea
                  className="w-full bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  placeholder={`Replying to ${comment.profiles?.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                />
                <button
                  onClick={handleReply}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-md text-xs font-semibold"
                >
                  Submit Reply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.children?.map((child: any) => (
        <div className="mt-4">
          <CommentItem
            key={child.id}
            comment={child}
            user={user}
            refresh={refresh}
            role={role}
          />
        </div>
      ))}
    </div>
  );
}

/* =========================
   MAIN PAGE
========================= */
export default function PostDetail() {
  const { postId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [role, setRole] = useState("");


  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      

      setUser(data.user);
      fetchPost();
      fetchComments();
      fetchProfile(data.user.id);
    };
    init();
  }, []);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`*, profiles ( username, profile_pic )`)
      .eq("id", postId)
      .single();

    setPost(data);
    setEditPostContent(data?.content);
  };

  const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
    setRole(data?.role || "user");

  if (error) {
    console.error(error.message);
    return null;
  }

  return data?.role || "user";
};

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`*, profiles ( username, profile_pic )`)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    setComments(data || []);
  };

  const createComment = async () => {
    if (!content) return;

    await supabase.from("comments").insert({
      post_id: Number(postId),
      user_id: user.id,
      content,
      parent_id: null,
    });

    setContent("");
    fetchComments();
  };

  const handleDeletePost = async () => {
    await supabase.from("posts").delete().eq("id", postId);
    router.push("/forum");
  };

  const handleEditPost = async () => {
    await supabase
      .from("posts")
      .update({ content: editPostContent })
      .eq("id", postId);

    setIsEditingPost(false);
    fetchPost();
  };

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    </div>
  );

  const tree = buildTree(comments);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        {/* POST SECTION */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={post.profiles?.profile_pic || "/defaultpp.png"}
              alt={post.profiles?.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-extrabold">{post.title}</h1>
              <p className="text-emerald-300 text-sm">
                by {post.profiles?.username}
              </p>
            </div>
          </div>

          {isEditingPost ? (
            <div className="space-y-3">
              <textarea
                className="w-full bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={5}
              />
              <button
                onClick={handleEditPost}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-xl shadow-lg transition active:scale-95"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <p className="mb-4 whitespace-pre-wrap text-white/90 leading-relaxed">{post.content}</p>
          )}

          {!isEditingPost && (post.user_id === user?.id || role === "admin") && (
            <div className="flex gap-3 mt-6">
              {post.user_id === user?.id && (
                <button
                  onClick={() => setIsEditingPost(true)}
                  className="bg-yellow-500/80 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                >
                  Edit Post
                </button>
              )}
              <button
                onClick={handleDeletePost}
                className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                Delete Post
              </button>
            </div>
          )}
        </div>

        {/* CREATE COMMENT */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-emerald-100 mb-4">
            Join the discussion
          </h2>
          <div className="space-y-3">
            <textarea
              className="w-full bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <button
              onClick={createComment}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition active:scale-95"
            >
              Post Comment
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="space-y-6">
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              role={role}
              refresh={fetchComments}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
