from board import Board
import copy

EXPLORE_CAP = 5

def explore(board, moveSeq, level):
	if level > EXPLORE_CAP:
		print str(sum(map(len, moveSeq))) + ": " + str(moveSeq)
		return
	moves = board.getMoves()
	for m in moves:
		newBoard = copy.deepcopy(board)
		newBoard.makeMove(m)
		explore(newBoard, moveSeq + (m,), level + 1)

root = Board()
root.pprint()
explore(root, (), 0)