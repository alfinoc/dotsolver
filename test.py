from board import Board

def testRandomBoardMovesValid(n):
	for i in range(0, n):
		board = Board()
		moves = board.getMoves()
		for m in moves:
			if not testMoveValid(m, board.grid):
				break
	print str(n) + " move sets passed!"
			
def testMoveValid(m, grid):
	color = None
	for dot in m:
		if color == None:
			color = grid[dot[0]][dot[1]]
		if color != grid[dot[0]][dot[1]]:
			print "A move with two different colors in it!"
			return False

def all():
	testRandomBoardMovesValid(100)

all()