import random as r
import pprint as pp

DIM = 6
WILD = 0
MAX = 5

# returns a random number in range [1, MAX)
def rand():
   return r.randint(1, MAX);

# returns true if (col, row) is a legal index for the board
def inBounds(col, row):
   return col >= 0 and row >= 0 and col < DIM and row < DIM

# returns true if this move contains a square
# bug: doesn't detect squares involving more than 4 dots
def hasSquare(move):
   return False

# gets all the points of a given color
def getAll(color):
   pts = []
   for col in range(0, DIM):
      for row in range(0, DIM):
         if self.grid[col][row] == color:
            pts.append((col, row))
   return tuple(pts)

class Board:
   def __init__(self, values=None):
      if values == None:
         self.grid = self.randGrid()
      else:
         self.grid = values
         checkRep()

   # returns a DIM x DIM list of random numbers between 1 and MAX
   def randGrid(self):
      grid = []
      for i in range(0, DIM):
         grid.append(map(lambda x: rand(), [None] * DIM))
      return grid

   # removes the element at (col, row), shifting all entries above
   # down and placing a WILD element at the top of that column
   def remove(self, col, row):
      if not inBounds(col, row):
         raise ValueError
      col = self.grid[col]
      for i in range(row, 0, -1):
         col[i] = col[i - 1]
      col[0] = WILD

   # removes all of the points in 'move' from the board.
   def makeMove(self, move):
      for dot in move:
         self.remove(dot[0], dot[1])

   # places a zero in the position of each pt (col, row) in pts
   def removeAll(pts):
      # mark all with WILD
      for pt in pts:
         self.grid[pt[0]][pt[1]] = WILD
      # TODO: move all WILDs to top (drop down)

   # there's a move that this currently misses: the two dots of the
   # same color completely surrounded by dots of that color, but only
   # selected themselves
   def getMoves(self):
      moves = set()
      for col in range(0, DIM):
         for row in range(0, DIM):
            self.getMovesStartingFrom(col, row, set(), None, moves)
      for m in moves:
         if isinstance(m, int):  # full color elimination move
            moves.remove(m)
            moves.add(getAll(m))
      return moves

   # adds to 'moves' every move starting from ('col', 'row'). 'chain'
   # holds the moves already made up to this point, and 'chainColor'
   # is (simply for convenience) the color of the given chain
   def getMovesStartingFrom(self, col, row, chain, chainColor, moves):
      if not inBounds(col, row) or (col, row) in chain \
            or (len(chain) > 0 and chainColor != self.grid[col][row]):
         if len(chain) > 2:
            move = frozenset(chain)
            moves.add(move)
            if not chainColor in moves and hasSquare(move):
               moves.add(chainColor)
         return
      if (self.grid[col][row] == WILD):
         return

      #choose
      chain.add((col, row))
      color = self.grid[col][row]
      #explore
      self.getMovesStartingFrom(col + 1, row, chain, color, moves)
      self.getMovesStartingFrom(col, row + 1, chain, color, moves)
      self.getMovesStartingFrom(col - 1, row, chain, color, moves)
      self.getMovesStartingFrom(col, row - 1, chain, color, moves)
      #unchoose
      chain.remove((col, row))

   # changes all WILD elements to random numbers between 1 and MAX
   def choose(self):
      for i in range(0, len(self.grid)):
         for j in range(0, len(self.grid[i])):
            if self.grid[i][j] == WILD:
               self.grid[i][j] = rand()

   def pprint(self):
      for i in range(0, DIM):
         line = ""
         for j in range(0, DIM):
            if str(self.grid[j][i]) == WILD:
               line += "X "
            else:
               line += str(self.grid[j][i]) + " "
         print line 
