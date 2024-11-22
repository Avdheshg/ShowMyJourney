

private TreeNode BuildTree(WebElementHierarchicalInfo info, CancellationToken token, bool isValidating)
{
    if(info.Parents != null && info.Parents.Any())
    {
        var parents = info.Parents.ToList();
        foreach(var infoParent in parents) //switch to last frame
        {
            GetDocument(infoParent.Element);
            if(infoParent.IsFrameOrObject)
            {
                infoParent.Element.SwitchToMe(wrapper);
            }
        }
        GetDocument(info.Element);
        var rootFolder = BuildBranch(info.Element, token, parents, true, true, false, isValidating);
        if(rootFolder == null)
        {
            {
                return null;
            }
        }

        for(var i = parents.Count - 1; i >= 0; i--)
        {
            if(parents[i].IsFrameOrObject)
            {
                wrapper.SwitchToParentFrame();
            }

            var frame = GetFrameTreeNode(parents[i].Element, parents.GetRange(0, i));
            if (frame != null)
            {
                frame.AddChild(rootFolder);
                rootFolder = BuildTreeByChild(frame);

                frame.IsExpanded = true;
            }
        }
        return rootFolder;

    }
    else
    {
        GetDocument(info.Element);
        var rootFolder = BuildBranch(info.Element, token, null, true, true, false, isValidating);
        return rootFolder;
    }
}















